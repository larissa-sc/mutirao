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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { paginaResposta } from '../common/paginacao.js';
import {
  AtualizarItemDto,
  CriarItemDto,
  ItemResposta,
  ListarItensDto,
} from './item.dto.js';
import { ItensService } from './itens.service.js';

class PaginaItens extends paginaResposta(ItemResposta) {}

@ApiTags('itens')
@Controller('itens')
export class ItensController {
  constructor(private readonly itens: ItensService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os itens do catálogo (paginada)' })
  @ApiOkResponse({ type: PaginaItens })
  listar(@Query() filtros: ListarItensDto) {
    return this.itens.listar(filtros);
  }

  @Get(':id')
  @ApiOkResponse({ type: ItemResposta })
  @ApiNotFoundResponse({ description: 'Item não encontrado' })
  buscarUm(@Param('id', ParseIntPipe) id: number) {
    return this.itens.buscarUm(id);
  }

  @Post()
  @HttpCode(201)
  @ApiCreatedResponse({ type: ItemResposta })
  @ApiConflictResponse({ description: 'Já existe um item com esse nome' })
  criar(@Body() dto: CriarItemDto) {
    return this.itens.criar(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ItemResposta })
  @ApiNotFoundResponse({ description: 'Item não encontrado' })
  @ApiConflictResponse({ description: 'Já existe um item com esse nome' })
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarItemDto,
  ) {
    return this.itens.atualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Item removido' })
  @ApiNotFoundResponse({ description: 'Item não encontrado' })
  @ApiConflictResponse({ description: 'O item já foi pedido' })
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.itens.remover(id);
  }
}
