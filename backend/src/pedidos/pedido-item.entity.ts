import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { numeroTransformer } from '../common/numero.transformer.js';
import { Item } from '../itens/item.entity.js';
import { Pedido } from './pedido.entity.js';

// Lado "muitos" de Pedido N-N Item: cada linha diz quanto de um item foi
// pedido. Não existe sem o pedido.
@Entity('pedido_itens')
@Unique(['pedidoId', 'itemId'])
@Check('"quantidade" > 0')
export class PedidoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.itens, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedidoId' })
  pedido: Relation<Pedido>;

  @Column()
  pedidoId: number;

  // Item do catálogo usado em pedidos já feitos não pode ser apagado.
  @ManyToOne(() => Item, (item) => item.pedidos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'itemId' })
  item: Relation<Item>;

  @Column()
  itemId: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numeroTransformer,
  })
  quantidade: number;

  @Column({ type: 'varchar', length: 30 })
  unidade: string;
}
