import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity.js';
import { Pedido } from './pedido.entity.js';
import { StatusPedido } from './status-pedido.enum.js';

// Registro de cada mudança de status. Somente de inclusão: nunca é editado.
@Entity('historico_status')
export class HistoricoStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.historico, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedidoId' })
  pedido: Relation<Pedido>;

  @Column()
  pedidoId: number;

  // `null` no primeiro registro (criação do pedido).
  @Column({ type: 'simple-enum', enum: StatusPedido, nullable: true })
  statusAnterior: StatusPedido | null;

  @Column({ type: 'simple-enum', enum: StatusPedido })
  statusNovo: StatusPedido;

  // Obrigatória quando o status novo é `negado`.
  @Column({ type: 'text', nullable: true })
  observacao: string | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.alteracoesDeStatus, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'responsavelId' })
  responsavel: Relation<Usuario>;

  @Column()
  responsavelId: number;

  @CreateDateColumn()
  data: Date;
}
