import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  deslocamento,
  montarPagina,
  type Pagina,
} from '../common/paginacao.js';
import { Pedido } from '../pedidos/pedido.entity.js';
import {
  type AtualizarCategoriaDto,
  CategoriaResposta,
  type CriarCategoriaDto,
  type ListarCategoriasDto,
} from './categoria.dto.js';
import { Categoria } from './categoria.entity.js';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categorias: Repository<Categoria>,
    @InjectRepository(Pedido)
    private readonly pedidos: Repository<Pedido>,
  ) {}

  async listar(
    filtros: ListarCategoriasDto,
  ): Promise<Pagina<CategoriaResposta>> {
    const consulta = this.categorias.createQueryBuilder('c');
    if (filtros.tipo) {
      consulta.andWhere('c.tipo = :tipo', { tipo: filtros.tipo });
    }
    if (filtros.q) {
      consulta.andWhere('c.nome ILIKE :q', { q: `%${filtros.q}%` });
    }
    const [lista, total] = await consulta
      .orderBy('c.nome', 'ASC')
      .skip(deslocamento(filtros))
      .take(filtros.pageSize)
      .getManyAndCount();

    return montarPagina(lista.map(CategoriaResposta.de), total, filtros);
  }

  async buscarUm(id: number): Promise<CategoriaResposta> {
    return CategoriaResposta.de(await this.obter(id));
  }

  async criar(dto: CriarCategoriaDto): Promise<CategoriaResposta> {
    await this.garantirNomeLivre(dto.nome);
    const criada = await this.categorias.save(this.categorias.create(dto));
    return CategoriaResposta.de(criada);
  }

  async atualizar(
    id: number,
    dto: AtualizarCategoriaDto,
  ): Promise<CategoriaResposta> {
    const categoria = await this.obter(id);
    if (dto.nome && dto.nome !== categoria.nome) {
      await this.garantirNomeLivre(dto.nome);
    }
    if (dto.tipo && dto.tipo !== categoria.tipo) {
      // Mudar o tipo mudaria as regras de pedidos já feitos.
      const emUso = await this.pedidos.countBy({ categoriaId: id });
      if (emUso > 0) {
        throw new ConflictException(
          'Não é possível mudar o tipo de uma categoria que já tem pedidos.',
        );
      }
    }
    Object.assign(categoria, dto);
    return CategoriaResposta.de(await this.categorias.save(categoria));
  }

  async remover(id: number): Promise<void> {
    const categoria = await this.obter(id);
    const emUso = await this.pedidos.countBy({ categoriaId: id });
    if (emUso > 0) {
      throw new ConflictException(
        'Não é possível apagar uma categoria que já tem pedidos.',
      );
    }
    await this.categorias.remove(categoria);
  }

  private async obter(id: number): Promise<Categoria> {
    const categoria = await this.categorias.findOneBy({ id });
    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada.');
    }
    return categoria;
  }

  private async garantirNomeLivre(nome: string): Promise<void> {
    if (await this.categorias.existsBy({ nome })) {
      throw new ConflictException('Já existe uma categoria com esse nome.');
    }
  }
}
