import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from '../categorias/categoria.entity.js';
import { PedidoItem } from '../pedidos/pedido-item.entity.js';
import { Pedido } from '../pedidos/pedido.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { DiagnosticoController } from './diagnostico.controller.js';
import { DiagnosticoService } from './diagnostico.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, Usuario, Categoria, PedidoItem])],
  controllers: [DiagnosticoController],
  providers: [DiagnosticoService],
})
export class DiagnosticoModule {}
