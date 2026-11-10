import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoItem } from '../pedidos/pedido-item.entity.js';
import { Item } from './item.entity.js';
import { ItensController } from './itens.controller.js';
import { ItensService } from './itens.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Item, PedidoItem])],
  controllers: [ItensController],
  providers: [ItensService],
})
export class ItensModule {}
