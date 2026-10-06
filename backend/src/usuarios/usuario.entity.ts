import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { HistoricoStatus } from '../pedidos/historico-status.entity.js';
import { Pedido } from '../pedidos/pedido.entity.js';
import { PapelUsuario } from './papel-usuario.enum.js';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  // Identificador do usuário no Firebase Auth. O sistema não guarda senhas.
  @Column({ type: 'varchar', length: 128, unique: true })
  firebaseUid: string;

  @Column({ type: 'varchar', length: 120 })
  nome: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    type: 'simple-enum',
    enum: PapelUsuario,
    default: PapelUsuario.MORADOR,
  })
  papel: PapelUsuario;

  @CreateDateColumn()
  dataCriacao: Date;

  @OneToMany(() => Pedido, (pedido) => pedido.autor)
  pedidos: Relation<Pedido[]>;

  @OneToMany(() => HistoricoStatus, (historico) => historico.responsavel)
  alteracoesDeStatus: Relation<HistoricoStatus[]>;
}
