import {
  type ArgumentsHost,
  BadRequestException,
  Catch,
  type ExceptionFilter,
  HttpException,
  type ValidationError,
} from '@nestjs/common';
import type { Response } from 'express';

const numeros = (texto: string) => texto.match(/-?\d+(?:\.\d+)?/g) ?? [];

// Mensagens do class-validator em português. Mensagens que o DTO já definiu
// em português (ex.: "Use o formato AAAA-MM-DD.") passam como estão.
const MENSAGENS: Record<string, (original: string) => string> = {
  isString: () => 'Deve ser um texto.',
  isInt: () => 'Deve ser um número inteiro.',
  isNumber: (o) =>
    o.includes('decimal places')
      ? `Use no máximo ${numeros(o)[0]} casas decimais.`
      : 'Deve ser um número.',
  isPositive: () => 'Deve ser maior que zero.',
  min: (o) => `Deve ser no mínimo ${numeros(o)[0]}.`,
  max: (o) => `Deve ser no máximo ${numeros(o)[0]}.`,
  isLength: (o) => {
    const [min, max] = numeros(o);
    return max
      ? `Use entre ${min} e ${max} caracteres.`
      : o.includes('longer')
        ? Number(min) === 1
          ? 'Não pode ficar vazio.'
          : `Use no mínimo ${min} caracteres.`
        : `Use no máximo ${min} caracteres.`;
  },
  isEnum: (o) => `Valor inválido. Valores aceitos: ${o.split(': ')[1]}.`,
  isIn: (o) => `Valor inválido. Valores aceitos: ${o.split(': ')[1]}.`,
  isArray: () => 'Deve ser uma lista.',
  arrayMaxSize: (o) => `A lista aceita no máximo ${numeros(o)[0]} itens.`,
  isIso8601: () => 'Data inválida.',
  whitelistValidation: () => 'Campo não permitido.',
};

function mensagens(erro: ValidationError): string[] {
  const constraints = erro.constraints ?? {};
  // Campo ausente: uma mensagem só, em vez de uma por regra violada.
  const ausente =
    (erro.value === undefined || erro.value === null) &&
    !('whitelistValidation' in constraints);
  if (ausente) {
    return ['Este campo é obrigatório.'];
  }
  return Object.entries(constraints).map(([chave, original]) =>
    MENSAGENS[chave] ? MENSAGENS[chave](original) : original,
  );
}

// Erros de validação: { campo: ["mensagem", ...] }, como no contrato da API.
export function erroDeValidacao(erros: ValidationError[]): BadRequestException {
  const campos: Record<string, string[]> = {};

  const coletar = (lista: ValidationError[], prefixo: string) => {
    for (const erro of lista) {
      const caminho = prefixo ? `${prefixo}.${erro.property}` : erro.property;
      if (erro.constraints) {
        campos[caminho] = mensagens(erro);
      }
      if (erro.children?.length) {
        coletar(erro.children, caminho);
      }
    }
  };
  coletar(erros, '');

  return new BadRequestException(campos);
}

// 401, 403, 404, 409...: { detail: "mensagem" }. Erros de validação passam
// como estão (objeto campo -> mensagens).
@Catch(HttpException)
export class FiltroDeExcecoes implements ExceptionFilter {
  catch(excecao: HttpException, host: ArgumentsHost) {
    const resposta = host.switchToHttp().getResponse<Response>();
    const status = excecao.getStatus();
    const corpo = excecao.getResponse();

    let saida: unknown = corpo;
    if (typeof corpo === 'string') {
      saida = { detail: corpo };
    } else if (typeof corpo === 'object' && corpo !== null) {
      const obj = corpo as Record<string, unknown>;
      if ('statusCode' in obj && 'message' in obj) {
        saida = {
          detail: Array.isArray(obj.message)
            ? obj.message.join('; ')
            : obj.message,
        };
      }
    }

    resposta.status(status).json(saida);
  }
}
