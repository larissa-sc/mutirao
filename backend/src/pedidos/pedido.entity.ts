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
import { Usuario } from '../usuarios/usuario.entity.js';
import { HistoricoStatus } from './historico-status.entity.js';
import { Localizacao } from './localizacao.entity.js';
import { PedidoItem } from './pedido-item.entity.js';
import { StatusPedido } from './status-pedido.enum.js';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  // Categoria apagada com pedidos apontando para ela perderia o contexto
  // dos pedidos já feitos: por isso RESTRICT.
  @ManyToOne(() => Categoria, (categoria) => categoria.pedidos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoriaId' })
  categoria: Relation<Categoria>;

  @Column()
  categoriaId: number;

  // Resumo do pedido (ex.: "Sementes para o plantio de março", "Rodagem do
  // ramal", "Declaração de morador").
  @Column({ type: 'varchar', length: 120 })
  titulo: string;

  // Em pedido de declaração, guarda a finalidade.
  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'date', nullable: true })
  dataDesejada: string | null;

  // Obrigatória em pedido de serviço de máquina; opcional em material.
  // O pedido é o dono da relação; a localização não existe sem ele.
  @OneToOne(() => Localizacao, (localizacao) => localizacao.pedido, {
    nullable: true,
    cascade: ['insert', 'update'],
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'localizacaoId' })
  localizacao: Relation<Localizacao> | null;

  @Column({ type: 'int', nullable: true })
  localizacaoId: number | null;

  // Quem fez o pedido não pode sumir e levar o histórico da Associação junto.
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

  // N-N com o catálogo de itens, resolvida em PedidoItem (a relação tem
  // atributos: quantidade e unidade).
  @OneToMany(() => PedidoItem, (linha) => linha.pedido, { cascade: ['insert'] })
  itens: Relation<PedidoItem[]>;

  @OneToMany(() => HistoricoStatus, (historico) => historico.pedido)
  historico: Relation<HistoricoStatus[]>;
}
