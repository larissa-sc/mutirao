import { ApiProperty } from '@nestjs/swagger';
import { TipoCategoria } from './tipo-categoria.enum.js';

export class CategoriaResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sementes' })
  nome: string;

  @ApiProperty({ enum: TipoCategoria, example: TipoCategoria.MATERIAL })
  tipo: TipoCategoria;
}

export class ListaCategoriasResponse {
  @ApiProperty({ example: 7 })
  count: number;

  @ApiProperty({ nullable: true, example: null })
  next: string | null;

  @ApiProperty({ nullable: true, example: null })
  previous: string | null;

  @ApiProperty({ type: [CategoriaResponse] })
  results: CategoriaResponse[];
}
