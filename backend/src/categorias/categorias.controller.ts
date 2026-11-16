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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { paginaResposta } from '../common/paginacao.js';
import {
  AtualizarCategoriaDto,
  CategoriaResposta,
  CriarCategoriaDto,
  ListarCategoriasDto,
} from './categoria.dto.js';
import { CategoriasService } from './categorias.service.js';

class PaginaCategorias extends paginaResposta(CategoriaResposta) {}

@ApiTags('categorias')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categorias: CategoriasService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as categorias (paginada)' })
  @ApiOkResponse({ type: PaginaCategorias })
  @ApiBadRequestResponse({
    description: 'Parâmetros de paginação ou busca inválidos',
  })
  listar(@Query() filtros: ListarCategoriasDto) {
    return this.categorias.listar(filtros);
  }

  @Get(':id')
  @ApiOkResponse({ type: CategoriaResposta })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  @ApiBadRequestResponse({ description: 'O id não é um número inteiro' })
  buscarUm(@Param('id', ParseIntPipe) id: number) {
    return this.categorias.buscarUm(id);
  }

  @Post()
  @HttpCode(201)
  @ApiCreatedResponse({ type: CategoriaResposta })
  @ApiConflictResponse({ description: 'Já existe uma categoria com esse nome' })
  @ApiBadRequestResponse({ description: 'Entrada inválida' })
  criar(@Body() dto: CriarCategoriaDto) {
    return this.categorias.criar(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CategoriaResposta })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  @ApiConflictResponse({ description: 'Nome repetido ou tipo em uso' })
  @ApiBadRequestResponse({ description: 'Entrada ou id inválido' })
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarCategoriaDto,
  ) {
    return this.categorias.atualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Categoria removida' })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  @ApiConflictResponse({ description: 'A categoria já tem pedidos' })
  @ApiBadRequestResponse({ description: 'O id não é um número inteiro' })
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.categorias.remover(id);
  }
}
