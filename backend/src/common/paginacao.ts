import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const TAMANHO_MAXIMO_PAGINA = 100;

// Parâmetros de paginação aceitos em todas as listagens (?page=&pageSize=).
export class PaginacaoDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  // O teto é proteção contra listagens gigantes, não capricho.
  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: TAMANHO_MAXIMO_PAGINA,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(TAMANHO_MAXIMO_PAGINA)
  pageSize: number = 20;
}

export interface Pagina<T> {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: T[];
}

export function montarPagina<T>(
  results: T[],
  count: number,
  { page, pageSize }: PaginacaoDto,
): Pagina<T> {
  return {
    count,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    results,
  };
}

export function deslocamento({ page, pageSize }: PaginacaoDto): number {
  return (page - 1) * pageSize;
}

// Cria a classe de resposta paginada de um recurso, para o Swagger mostrar
// o formato real em vez de "Object".
export function paginaResposta<T>(tipo: new () => T) {
  class PaginaResposta implements Pagina<T> {
    @ApiProperty() count: number;
    @ApiProperty() page: number;
    @ApiProperty() pageSize: number;
    @ApiProperty() totalPages: number;
    @ApiProperty({ type: [tipo] }) results: T[];
  }
  Object.defineProperty(PaginaResposta, 'name', {
    value: `Pagina${tipo.name}`,
  });
  return PaginaResposta;
}
