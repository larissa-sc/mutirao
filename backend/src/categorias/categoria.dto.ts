import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PaginacaoDto } from '../common/paginacao.js';
import type { Categoria } from './categoria.entity.js';
import { TipoCategoria } from './tipo-categoria.enum.js';

export class CriarCategoriaDto {
  @ApiProperty({ example: 'Sementes' })
  @IsString()
  @Length(1, 80)
  nome: string;

  @ApiProperty({
    enum: TipoCategoria,
    description:
      'material: itens do catálogo · servico: máquina (exige localização) · documento: declaração',
  })
  @IsEnum(TipoCategoria)
  tipo: TipoCategoria;
}

// PATCH: tudo opcional, validações preservadas.
export class AtualizarCategoriaDto extends PartialType(CriarCategoriaDto) {}

export class ListarCategoriasDto extends PaginacaoDto {
  @ApiPropertyOptional({ enum: TipoCategoria })
  @IsOptional()
  @IsEnum(TipoCategoria)
  tipo?: TipoCategoria;

  @ApiPropertyOptional({ description: 'Busca no nome' })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  q?: string;
}

export class CategoriaResposta {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiProperty({ enum: TipoCategoria }) tipo: TipoCategoria;

  static de(categoria: Categoria): CategoriaResposta {
    const r = new CategoriaResposta();
    r.id = categoria.id;
    r.nome = categoria.nome;
    r.tipo = categoria.tipo;
    return r;
  }
}
