import {
  Check,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Pedido } from './pedido.entity.js';

@Entity('localizacoes')
@Check('"latitude" BETWEEN -90 AND 90')
@Check('"longitude" BETWEEN -180 AND 180')
export class Localizacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @OneToOne(() => Pedido, (pedido) => pedido.localizacao)
  pedido: Relation<Pedido>;
}
