import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Categoria } from '../categorias/categoria.entity.js';
import { numeroTransformer } from '../common/numero.transformer.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { HistoricoStatus } from './historico-status.entity.js';
import { Localizacao } from './localizacao.entity.js';
import { StatusPedido } from './status-pedido.enum.js';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.pedidos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoriaId' })
  categoria: Relation<Categoria>;

  @Column()
  categoriaId: number;

  // O que está sendo pedido (ex.: "Semente de milho", "Declaração de morador").
  @Column({ type: 'varchar', length: 120 })
  item: string;

  // Obrigatória em pedido de material; opcional nos demais.
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numeroTransformer,
  })
  quantidade: number | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  unidade: string | null;

  // Em pedido de declaração, guarda a finalidade.
  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'date', nullable: true })
  dataDesejada: string | null;

  // Obrigatória em pedido de serviço de máquina; opcional em material.
  @OneToOne(() => Localizacao, (localizacao) => localizacao.pedido, {
    nullable: true,
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'localizacaoId' })
  localizacao: Relation<Localizacao> | null;

  @Column({ type: 'int', nullable: true })
  localizacaoId: number | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.pedidos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'autorId' })
  autor: Relation<Usuario>;

  @Column()
  autorId: number;

  @Column({
    type: 'simple-enum',
    enum: StatusPedido,
    default: StatusPedido.SOLICITADO,
  })
  status: StatusPedido;

  @CreateDateColumn()
  dataCriacao: Date;

  @UpdateDateColumn()
  dataAtualizacao: Date;

  @OneToMany(() => HistoricoStatus, (historico) => historico.pedido)
  historico: Relation<HistoricoStatus[]>;
}
