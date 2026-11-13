import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { TipoCategoria } from '../categorias/tipo-categoria.enum.js';
import { PaginacaoDto } from '../common/paginacao.js';
import type { HistoricoStatus } from './historico-status.entity.js';
import type { Pedido } from './pedido.entity.js';
import { StatusPedido } from './status-pedido.enum.js';

export class LocalizacaoDto {
  @ApiProperty({ example: -8.123456, minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -34.987654, minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class ItemDoPedidoDto {
  @ApiProperty({ example: 1, description: 'Id do item no catálogo' })
  @IsInt()
  @Min(1)
  itemId: number;

  @ApiProperty({ example: 20 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  quantidade: number;

  @ApiPropertyOptional({
    example: 'kg',
    description: 'Se omitida, usa a unidade padrão do item',
  })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  unidade?: string;
}

export class CriarPedidoDto {
  @ApiProperty({
    description:
      'Temporário: até a autenticação (Etapa 3) o autor é informado aqui. Depois virá do token.',
  })
  @IsInt()
  @Min(1)
  autorId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  categoriaId: number;

  @ApiProperty({ example: 'Sementes para o plantio de março' })
  @IsString()
  @Length(1, 120)
  titulo: string;

  @ApiPropertyOptional({
    description: 'Detalhes. Em pedido de declaração, a finalidade.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  descricao?: string;

  @ApiPropertyOptional({ example: '2026-11-15', description: 'AAAA-MM-DD' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use o formato AAAA-MM-DD.' })
  @IsISO8601({ strict: true })
  dataDesejada?: string;

  @ApiPropertyOptional({
    type: LocalizacaoDto,
    description: 'Obrigatória em serviço de máquina; opcional em material',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizacaoDto)
  localizacao?: LocalizacaoDto;

  @ApiPropertyOptional({
    type: [ItemDoPedidoDto],
    description: 'Obrigatório em pedido de material',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ItemDoPedidoDto)
  itens?: ItemDoPedidoDto[];
}

// PATCH: a categoria e o autor não mudam; o resto é opcional.
export class AtualizarPedidoDto extends PartialType(
  OmitType(CriarPedidoDto, ['autorId', 'categoriaId'] as const),
) {}

export class AlterarStatusDto {
  @ApiProperty({ enum: StatusPedido })
  @IsEnum(StatusPedido)
  status: StatusPedido;

  @ApiPropertyOptional({
    description: 'Obrigatória quando o status é "negado"',
  })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  observacao?: string;

  @ApiProperty({
    description:
      'Temporário: até a autenticação (Etapa 3) quem altera é informado aqui. Depois virá do token.',
  })
  @IsInt()
  @Min(1)
  responsavelId: number;
}

export class ListarPedidosDto extends PaginacaoDto {
  @ApiPropertyOptional({ enum: StatusPedido })
  @IsOptional()
  @IsEnum(StatusPedido)
  status?: StatusPedido;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoriaId?: number;

  @ApiPropertyOptional({ enum: TipoCategoria })
  @IsOptional()
  @IsEnum(TipoCategoria)
  tipo?: TipoCategoria;

  @ApiPropertyOptional({
    description: 'Temporário: filtra pelo autor (o morador vê só os seus)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  autorId?: number;

  @ApiPropertyOptional({ description: 'Busca no título e na descrição' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  q?: string;

  @ApiPropertyOptional({
    enum: ['dataCriacao', '-dataCriacao'],
    default: '-dataCriacao',
  })
  @IsOptional()
  @IsIn(['dataCriacao', '-dataCriacao'])
  ordering: 'dataCriacao' | '-dataCriacao' = '-dataCriacao';
}

export class CategoriaResumo {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
  @ApiProperty({ enum: TipoCategoria }) tipo: TipoCategoria;
}

export class UsuarioResumo {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
}

export class LocalizacaoResposta {
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
}

export class ItemResumo {
  @ApiProperty() id: number;
  @ApiProperty() nome: string;
}

export class ItemPedidoResposta {
  @ApiProperty({ type: ItemResumo }) item: ItemResumo;
  @ApiProperty() quantidade: number;
  @ApiProperty() unidade: string;
}

export class PedidoResposta {
  @ApiProperty() id: number;
  @ApiProperty({ type: CategoriaResumo }) categoria: CategoriaResumo;
  @ApiProperty() titulo: string;
  @ApiProperty({ type: String, nullable: true }) descricao: string | null;
  @ApiProperty({ type: String, nullable: true }) dataDesejada: string | null;
  @ApiProperty({ type: LocalizacaoResposta, nullable: true })
  localizacao: LocalizacaoResposta | null;
  @ApiProperty({ type: [ItemPedidoResposta] }) itens: ItemPedidoResposta[];
  @ApiProperty({ type: UsuarioResumo }) autor: UsuarioResumo;
  @ApiProperty({ enum: StatusPedido }) status: StatusPedido;
  @ApiProperty() dataCriacao: Date;
  @ApiProperty() dataAtualizacao: Date;

  // A entidade nunca sai na resposta: só os campos do contrato.
  static de(pedido: Pedido): PedidoResposta {
    const r = new PedidoResposta();
    r.id = pedido.id;
    r.categoria = {
      id: pedido.categoria.id,
      nome: pedido.categoria.nome,
      tipo: pedido.categoria.tipo,
    };
    r.titulo = pedido.titulo;
    r.descricao = pedido.descricao;
    r.dataDesejada = pedido.dataDesejada;
    r.localizacao = pedido.localizacao
      ? {
          latitude: pedido.localizacao.latitude,
          longitude: pedido.localizacao.longitude,
        }
      : null;
    r.itens = (pedido.itens ?? []).map((linha) => ({
      item: { id: linha.item.id, nome: linha.item.nome },
      quantidade: linha.quantidade,
      unidade: linha.unidade,
    }));
    r.autor = { id: pedido.autor.id, nome: pedido.autor.nome };
    r.status = pedido.status;
    r.dataCriacao = pedido.dataCriacao;
    r.dataAtualizacao = pedido.dataAtualizacao;
    return r;
  }
}

export class HistoricoResposta {
  @ApiProperty() id: number;
  @ApiProperty({ enum: StatusPedido, nullable: true })
  statusAnterior: StatusPedido | null;
  @ApiProperty({ enum: StatusPedido }) statusNovo: StatusPedido;
  @ApiProperty({ type: String, nullable: true }) observacao: string | null;
  @ApiProperty({ type: UsuarioResumo }) responsavel: UsuarioResumo;
  @ApiProperty() data: Date;

  static de(h: HistoricoStatus): HistoricoResposta {
    const r = new HistoricoResposta();
    r.id = h.id;
    r.statusAnterior = h.statusAnterior;
    r.statusNovo = h.statusNovo;
    r.observacao = h.observacao;
    r.responsavel = { id: h.responsavel.id, nome: h.responsavel.nome };
    r.data = h.data;
    return r;
  }
}
