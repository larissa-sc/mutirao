import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from '../categorias/categoria.entity.js';
import { Item } from '../itens/item.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { HistoricoStatus } from './historico-status.entity.js';
import { Pedido } from './pedido.entity.js';
import { PedidosController } from './pedidos.controller.js';
import { PedidosService } from './pedidos.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      Categoria,
      Usuario,
      Item,
      HistoricoStatus,
    ]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
