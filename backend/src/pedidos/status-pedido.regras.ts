import { TipoCategoria } from '../categorias/tipo-categoria.enum.js';
import { PapelUsuario } from '../usuarios/papel-usuario.enum.js';
import { StatusPedido } from './status-pedido.enum.js';

// Transições permitidas (ver docs/dominio.md). Estados finais não têm saída.
export const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  [StatusPedido.SOLICITADO]: [
    StatusPedido.EM_ANALISE,
    StatusPedido.NEGADO,
    StatusPedido.CANCELADO,
  ],
  [StatusPedido.EM_ANALISE]: [
    StatusPedido.APROVADO,
    StatusPedido.ENCAMINHADO,
    StatusPedido.NEGADO,
    StatusPedido.CANCELADO,
  ],
  [StatusPedido.APROVADO]: [StatusPedido.ATENDIDO, StatusPedido.NEGADO],
  [StatusPedido.ENCAMINHADO]: [StatusPedido.ATENDIDO, StatusPedido.NEGADO],
  [StatusPedido.ATENDIDO]: [],
  [StatusPedido.NEGADO]: [],
  [StatusPedido.CANCELADO]: [],
};

// Cancelar é a única mudança que o morador (autor) pode fazer.
const STATUS_DO_MORADOR = [StatusPedido.CANCELADO];

// Devolve a mensagem de erro, ou null se a transição é válida.
export function validarTransicao(
  de: StatusPedido,
  para: StatusPedido,
  tipo: TipoCategoria,
): string | null {
  if (!TRANSICOES[de].includes(para)) {
    return `Não é possível mudar de "${de}" para "${para}".`;
  }
  if (para === StatusPedido.ENCAMINHADO && tipo !== TipoCategoria.SERVICO) {
    return 'Só pedidos de serviço de máquina podem ser encaminhados à Prefeitura.';
  }
  if (para === StatusPedido.APROVADO && tipo === TipoCategoria.SERVICO) {
    return 'Pedidos de serviço de máquina são encaminhados, não aprovados.';
  }
  return null;
}

// Devolve a mensagem de erro, ou null se o usuário pode fazer a mudança.
export function validarPermissao(
  para: StatusPedido,
  papel: PapelUsuario,
  ehAutor: boolean,
): string | null {
  if (papel === PapelUsuario.ASSOCIACAO) {
    return null;
  }
  if (STATUS_DO_MORADOR.includes(para) && ehAutor) {
    return null;
  }
  return 'Você não tem permissão para realizar esta operação.';
}

export interface DadosPedido {
  tipo: TipoCategoria;
  quantidadeDeItens: number;
  temLocalizacao: boolean;
}

// Regras de preenchimento por tipo de pedido (ver docs/contrato-api.md).
// Devolve um objeto campo -> mensagens, vazio se está tudo certo.
export function validarPreenchimento({
  tipo,
  quantidadeDeItens,
  temLocalizacao,
}: DadosPedido): Record<string, string[]> {
  const erros: Record<string, string[]> = {};

  if (tipo === TipoCategoria.MATERIAL && quantidadeDeItens === 0) {
    erros.itens = ['Informe ao menos um item para pedidos de material.'];
  }
  if (tipo !== TipoCategoria.MATERIAL && quantidadeDeItens > 0) {
    erros.itens = ['Itens só se aplicam a pedidos de material.'];
  }
  if (tipo === TipoCategoria.SERVICO && !temLocalizacao) {
    erros.localizacao = [
      'Informe a localização para pedidos de serviço de máquina.',
    ];
  }
  if (tipo === TipoCategoria.DOCUMENTO && temLocalizacao) {
    erros.localizacao = ['Localização não se aplica a pedidos de declaração.'];
  }
  return erros;
}
