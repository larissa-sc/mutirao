import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { paginaResposta } from '../common/paginacao.js';
import {
  AlterarStatusDto,
  AtualizarPedidoDto,
  CriarPedidoDto,
  HistoricoResposta,
  ListarPedidosDto,
  PedidoResposta,
} from './pedido.dto.js';
import { PedidosService } from './pedidos.service.js';

class PaginaPedidos extends paginaResposta(PedidoResposta) {}

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidos: PedidosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os pedidos (paginada, com filtros)' })
  @ApiOkResponse({ type: PaginaPedidos })
  listar(@Query() filtros: ListarPedidosDto) {
    return this.pedidos.listar(filtros);
  }

  @Get(':id')
  @ApiOkResponse({ type: PedidoResposta })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  buscarUm(@Param('id', ParseIntPipe) id: number) {
    return this.pedidos.buscarUm(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Cria um pedido de material, serviço de máquina ou declaração',
  })
  @ApiCreatedResponse({ type: PedidoResposta })
  @ApiBadRequestResponse({
    description: 'Campos inválidos ou incompatíveis com o tipo da categoria',
  })
  criar(@Body() dto: CriarPedidoDto) {
    return this.pedidos.criar(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Altera o pedido (somente enquanto "solicitado")' })
  @ApiOkResponse({ type: PedidoResposta })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiConflictResponse({ description: 'O pedido já saiu de "solicitado"' })
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarPedidoDto,
  ) {
    return this.pedidos.atualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Apaga o pedido (somente enquanto "solicitado")' })
  @ApiNoContentResponse({ description: 'Pedido removido' })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiConflictResponse({ description: 'O pedido já saiu de "solicitado"' })
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.pedidos.remover(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Altera o status, respeitando as transições' })
  @ApiOkResponse({ type: PedidoResposta })
  @ApiBadRequestResponse({
    description: 'Transição inválida ou motivo ausente',
  })
  @ApiForbiddenResponse({ description: 'Sem permissão para esta mudança' })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  alterarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AlterarStatusDto,
  ) {
    return this.pedidos.alterarStatus(id, dto);
  }

  @Get(':id/historico')
  @ApiOkResponse({ type: [HistoricoResposta] })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  historico(@Param('id', ParseIntPipe) id: number) {
    return this.pedidos.historico(id);
  }
}
