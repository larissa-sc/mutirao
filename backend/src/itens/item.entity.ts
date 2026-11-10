import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { PedidoItem } from '../pedidos/pedido-item.entity.js';

// Catálogo do que a Associação pode atender (sementes, adubo, ferramentas...).
@Entity('itens')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  nome: string;

  // Unidade sugerida no pedido (kg, saco, unidade...).
  @Column({ type: 'varchar', length: 30 })
  unidadePadrao: string;

  @OneToMany(() => PedidoItem, (linha) => linha.item)
  pedidos: Relation<PedidoItem[]>;
}
