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
import { PedidoItem } from '../pedidos/pedido-item.entity.js';
import {
  type AtualizarItemDto,
  type CriarItemDto,
  ItemResposta,
  type ListarItensDto,
} from './item.dto.js';
import { Item } from './item.entity.js';

@Injectable()
export class ItensService {
  constructor(
    @InjectRepository(Item) private readonly itens: Repository<Item>,
    @InjectRepository(PedidoItem)
    private readonly linhas: Repository<PedidoItem>,
  ) {}

  async listar(filtros: ListarItensDto): Promise<Pagina<ItemResposta>> {
    const consulta = this.itens.createQueryBuilder('i');
    if (filtros.q) {
      consulta.andWhere('i.nome ILIKE :q', { q: `%${filtros.q}%` });
    }
    const [lista, total] = await consulta
      .orderBy('i.nome', 'ASC')
      .skip(deslocamento(filtros))
      .take(filtros.pageSize)
      .getManyAndCount();

    return montarPagina(lista.map(ItemResposta.de), total, filtros);
  }

  async buscarUm(id: number): Promise<ItemResposta> {
    return ItemResposta.de(await this.obter(id));
  }

  async criar(dto: CriarItemDto): Promise<ItemResposta> {
    await this.garantirNomeLivre(dto.nome);
    return ItemResposta.de(await this.itens.save(this.itens.create(dto)));
  }

  async atualizar(id: number, dto: AtualizarItemDto): Promise<ItemResposta> {
    const item = await this.obter(id);
    if (dto.nome && dto.nome !== item.nome) {
      await this.garantirNomeLivre(dto.nome);
    }
    Object.assign(item, dto);
    return ItemResposta.de(await this.itens.save(item));
  }

  async remover(id: number): Promise<void> {
    const item = await this.obter(id);
    if (await this.linhas.existsBy({ itemId: id })) {
      throw new ConflictException(
        'Não é possível apagar um item que já foi pedido.',
      );
    }
    await this.itens.remove(item);
  }

  private async obter(id: number): Promise<Item> {
    const item = await this.itens.findOneBy({ id });
    if (!item) {
      throw new NotFoundException('Item não encontrado.');
    }
    return item;
  }

  private async garantirNomeLivre(nome: string): Promise<void> {
    if (await this.itens.existsBy({ nome })) {
      throw new ConflictException('Já existe um item com esse nome.');
    }
  }
}
