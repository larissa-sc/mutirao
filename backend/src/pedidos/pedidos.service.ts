import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Categoria } from '../categorias/categoria.entity.js';
import {
  deslocamento,
  montarPagina,
  type Pagina,
} from '../common/paginacao.js';
import { Item } from '../itens/item.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { HistoricoStatus } from './historico-status.entity.js';
import { Localizacao } from './localizacao.entity.js';
import { PedidoItem } from './pedido-item.entity.js';
import {
  type AlterarStatusDto,
  type AtualizarPedidoDto,
  type CriarPedidoDto,
  HistoricoResposta,
  type ItemDoPedidoDto,
  type ListarPedidosDto,
  PedidoResposta,
} from './pedido.dto.js';
import { Pedido } from './pedido.entity.js';
import { StatusPedido } from './status-pedido.enum.js';
import {
  validarPermissao,
  validarPreenchimento,
  validarTransicao,
} from './status-pedido.regras.js';

const MENSAGEM_SO_SOLICITADO =
  'O pedido só pode ser alterado ou apagado enquanto estiver "solicitado".';

// Todas as regras de negócio dos pedidos ficam aqui, não no controller.
@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido) private readonly pedidos: Repository<Pedido>,
    @InjectRepository(Categoria)
    private readonly categorias: Repository<Categoria>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Item) private readonly itens: Repository<Item>,
    @InjectRepository(HistoricoStatus)
    private readonly historicos: Repository<HistoricoStatus>,
    private readonly dataSource: DataSource,
  ) {}

  async listar(filtros: ListarPedidosDto): Promise<Pagina<PedidoResposta>> {
    // Um único SELECT com joins: sem N+1 ao montar a resposta.
    const consulta = this.pedidos
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.categoria', 'c')
      .innerJoinAndSelect('p.autor', 'a')
      .leftJoinAndSelect('p.localizacao', 'l')
      .leftJoinAndSelect('p.itens', 'pi')
      .leftJoinAndSelect('pi.item', 'i');

    if (filtros.status) {
      consulta.andWhere('p.status = :status', { status: filtros.status });
    }
    if (filtros.categoriaId) {
      consulta.andWhere('p.categoriaId = :categoriaId', {
        categoriaId: filtros.categoriaId,
      });
    }
    if (filtros.tipo) {
      consulta.andWhere('c.tipo = :tipo', { tipo: filtros.tipo });
    }
    if (filtros.autorId) {
      consulta.andWhere('p.autorId = :autorId', { autorId: filtros.autorId });
    }
    if (filtros.q) {
      consulta.andWhere('(p.titulo ILIKE :q OR p.descricao ILIKE :q)', {
        q: `%${filtros.q}%`,
      });
    }

    const sentido = filtros.ordering.startsWith('-') ? 'DESC' : 'ASC';
    const [lista, total] = await consulta
      .orderBy('p.dataCriacao', sentido)
      .addOrderBy('p.id', sentido)
      .skip(deslocamento(filtros))
      .take(filtros.pageSize)
      .getManyAndCount();

    return montarPagina(lista.map(PedidoResposta.de), total, filtros);
  }

  async buscarUm(id: number): Promise<PedidoResposta> {
    return PedidoResposta.de(await this.obter(id));
  }

  async criar(dto: CriarPedidoDto): Promise<PedidoResposta> {
    const categoria = await this.categorias.findOneBy({ id: dto.categoriaId });
    if (!categoria) {
      throw erroDeCampo('categoriaId', 'Categoria não encontrada.');
    }
    const autor = await this.usuarios.findOneBy({ id: dto.autorId });
    if (!autor) {
      throw erroDeCampo('autorId', 'Usuário não encontrado.');
    }

    const itensDoPedido = dto.itens ?? [];
    this.exigirPreenchimento(
      categoria,
      itensDoPedido.length,
      !!dto.localizacao,
    );
    const linhas = await this.montarLinhas(itensDoPedido);

    const id = await this.dataSource.transaction(async (em) => {
      const pedido = em.create(Pedido, {
        categoriaId: categoria.id,
        autorId: autor.id,
        titulo: dto.titulo,
        descricao: dto.descricao ?? null,
        dataDesejada: dto.dataDesejada ?? null,
        status: StatusPedido.SOLICITADO,
        localizacao: dto.localizacao
          ? em.create(Localizacao, dto.localizacao)
          : null,
        itens: linhas.map((l) => em.create(PedidoItem, l)),
      });
      const salvo = await em.save(pedido);
      await em.save(
        em.create(HistoricoStatus, {
          pedidoId: salvo.id,
          statusAnterior: null,
          statusNovo: StatusPedido.SOLICITADO,
          observacao: null,
          responsavelId: autor.id,
        }),
      );
      return salvo.id;
    });

    return this.buscarUm(id);
  }

  async atualizar(
    id: number,
    dto: AtualizarPedidoDto,
  ): Promise<PedidoResposta> {
    const pedido = await this.obter(id);
    if (pedido.status !== StatusPedido.SOLICITADO) {
      throw new ConflictException(MENSAGEM_SO_SOLICITADO);
    }

    // As regras por tipo valem para o pedido já com as mudanças aplicadas.
    const quantidadeDeItens = dto.itens
      ? dto.itens.length
      : pedido.itens.length;
    const temLocalizacao =
      dto.localizacao !== undefined ? !!dto.localizacao : !!pedido.localizacao;
    this.exigirPreenchimento(
      pedido.categoria,
      quantidadeDeItens,
      temLocalizacao,
    );
    const linhas = dto.itens ? await this.montarLinhas(dto.itens) : null;

    await this.dataSource.transaction(async (em) => {
      if (dto.titulo !== undefined) pedido.titulo = dto.titulo;
      if (dto.descricao !== undefined) pedido.descricao = dto.descricao;
      if (dto.dataDesejada !== undefined) {
        pedido.dataDesejada = dto.dataDesejada;
      }

      if (dto.localizacao) {
        if (pedido.localizacao) {
          Object.assign(pedido.localizacao, dto.localizacao);
        } else {
          pedido.localizacao = em.create(Localizacao, dto.localizacao);
        }
      }

      // A localização nova ou alterada é salva em cascata junto com o pedido.
      await em.save(pedido);

      if (linhas) {
        await em.delete(PedidoItem, { pedidoId: id });
        await em.save(
          PedidoItem,
          linhas.map((l) => em.create(PedidoItem, { ...l, pedidoId: id })),
        );
      }
    });

    return this.buscarUm(id);
  }

  async remover(id: number): Promise<void> {
    const pedido = await this.obter(id);
    if (pedido.status !== StatusPedido.SOLICITADO) {
      throw new ConflictException(MENSAGEM_SO_SOLICITADO);
    }
    await this.dataSource.transaction(async (em) => {
      // Itens e histórico caem junto (CASCADE); a localização é do pedido.
      await em.delete(Pedido, { id });
      if (pedido.localizacaoId) {
        await em.delete(Localizacao, { id: pedido.localizacaoId });
      }
    });
  }

  async alterarStatus(
    id: number,
    dto: AlterarStatusDto,
  ): Promise<PedidoResposta> {
    const pedido = await this.obter(id);
    const responsavel = await this.usuarios.findOneBy({
      id: dto.responsavelId,
    });
    if (!responsavel) {
      throw erroDeCampo('responsavelId', 'Usuário não encontrado.');
    }

    const semPermissao = validarPermissao(
      dto.status,
      responsavel.papel,
      responsavel.id === pedido.autorId,
    );
    if (semPermissao) {
      throw new ForbiddenException(semPermissao);
    }

    const transicaoInvalida = validarTransicao(
      pedido.status,
      dto.status,
      pedido.categoria.tipo,
    );
    if (transicaoInvalida) {
      throw erroDeCampo('status', transicaoInvalida);
    }
    if (dto.status === StatusPedido.NEGADO && !dto.observacao) {
      throw erroDeCampo('observacao', 'Informe o motivo ao negar um pedido.');
    }

    await this.dataSource.transaction(async (em) => {
      await em.update(Pedido, { id }, { status: dto.status });
      await em.save(
        em.create(HistoricoStatus, {
          pedidoId: id,
          statusAnterior: pedido.status,
          statusNovo: dto.status,
          observacao: dto.observacao ?? null,
          responsavelId: responsavel.id,
        }),
      );
    });

    return this.buscarUm(id);
  }

  async historico(id: number): Promise<HistoricoResposta[]> {
    if (!(await this.pedidos.existsBy({ id }))) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    const registros = await this.historicos.find({
      where: { pedidoId: id },
      relations: { responsavel: true },
      order: { id: 'ASC' },
    });
    return registros.map(HistoricoResposta.de);
  }

  private async obter(id: number): Promise<Pedido> {
    const pedido = await this.pedidos.findOne({
      where: { id },
      relations: {
        categoria: true,
        autor: true,
        localizacao: true,
        itens: { item: true },
      },
      order: { itens: { id: 'ASC' } },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    return pedido;
  }

  private exigirPreenchimento(
    categoria: Categoria,
    quantidadeDeItens: number,
    temLocalizacao: boolean,
  ): void {
    const erros = validarPreenchimento({
      tipo: categoria.tipo,
      quantidadeDeItens,
      temLocalizacao,
    });
    if (Object.keys(erros).length > 0) {
      throw new BadRequestException(erros);
    }
  }

  // Confere o catálogo e completa a unidade com a padrão do item.
  private async montarLinhas(
    itens: ItemDoPedidoDto[],
  ): Promise<{ itemId: number; quantidade: number; unidade: string }[]> {
    if (itens.length === 0) {
      return [];
    }
    const ids = itens.map((i) => i.itemId);
    if (new Set(ids).size !== ids.length) {
      throw erroDeCampo('itens', 'O mesmo item aparece mais de uma vez.');
    }
    const catalogo = await this.itens.findBy({ id: In(ids) });
    const porId = new Map(catalogo.map((i) => [i.id, i]));
    const ausentes = ids.filter((id) => !porId.has(id));
    if (ausentes.length > 0) {
      throw erroDeCampo(
        'itens',
        `Item(ns) não encontrado(s) no catálogo: ${ausentes.join(', ')}.`,
      );
    }
    return itens.map((i) => ({
      itemId: i.itemId,
      quantidade: i.quantidade,
      unidade: i.unidade ?? porId.get(i.itemId)!.unidadePadrao,
    }));
  }
}

function erroDeCampo(campo: string, mensagem: string): BadRequestException {
  return new BadRequestException({ [campo]: [mensagem] });
}
