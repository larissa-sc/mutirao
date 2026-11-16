import { Controller, Get, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { PaginacaoDto } from '../common/paginacao.js';
import { DiagnosticoService } from './diagnostico.service.js';

// Fora do contrato público: não entra no Swagger nem no openapi.json.
@ApiExcludeController()
@Controller('diagnostico/n-mais-um')
export class DiagnosticoController {
  constructor(private readonly diagnostico: DiagnosticoService) {}

  @Get('ruim')
  ruim(@Query() { pageSize }: PaginacaoDto) {
    return this.diagnostico.ruim(pageSize);
  }

  @Get('boa')
  boa(@Query() { pageSize }: PaginacaoDto) {
    return this.diagnostico.boa(pageSize);
  }
}
