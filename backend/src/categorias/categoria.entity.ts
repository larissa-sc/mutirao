import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Pedido } from '../pedidos/pedido.entity.js';
import { TipoCategoria } from './tipo-categoria.enum.js';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80, unique: true })
  nome: string;

  // Define as regras de preenchimento do pedido (material, serviço ou documento).
  @Column({ type: 'simple-enum', enum: TipoCategoria })
  tipo: TipoCategoria;

  @OneToMany(() => Pedido, (pedido) => pedido.categoria)
  pedidos: Relation<Pedido[]>;
}
