import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriaResponse, ListaCategoriasResponse } from './categoria.dto.js';
import { CategoriaService } from './categoria.service.js';

@ApiTags('Categorias')
@Controller('categorias')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as categorias disponíveis' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20, maximum: 100 })
  @ApiOkResponse({ type: ListaCategoriasResponse })
  @ApiBadRequestResponse({ description: 'Parâmetros de paginação inválidos.' })
  listar(
    @Query('page', new DefaultValuePipe('1'), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe('20'), ParseIntPipe)
    pageSize: number,
  ): ListaCategoriasResponse {
    return this.categoriaService.listar(page, pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta uma categoria pelo identificador' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ type: CategoriaResponse })
  @ApiBadRequestResponse({ description: 'O identificador deve ser numérico.' })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada.' })
  buscarPorId(@Param('id', ParseIntPipe) id: number): CategoriaResponse {
    return this.categoriaService.buscarPorId(id);
  }
}
