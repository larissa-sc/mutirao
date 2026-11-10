import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { PaginacaoDto } from '../common/paginacao.js';
import type { Item } from './item.entity.js';

export class CriarItemDto {
  @ApiProperty({ example: 'Semente de milho' })
  @IsString()
  @Length(1, 120)
  nome: string;

  @ApiProperty({ example: 'kg', description: 'Unidade sugerida no pedido' })
  @IsString()
  @Length(1, 30)
  unidadePadrao: string;
}

// PATCH: tudo opcional, validações preservadas.
export class AtualizarItemDto extends PartialType(CriarItemDto) {}

export class ListarItensDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Busca no nome' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  q?: string;
}

export class ItemResposta {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiProperty() unidadePadrao: string;

  static de(item: Item): ItemResposta {
    const r = new ItemResposta();
    r.id = item.id;
    r.nome = item.nome;
    r.unidadePadrao = item.unidadePadrao;
    return r;
  }
}
