import { TipoCategoria } from '../categorias/tipo-categoria.enum.js';
import { PapelUsuario } from '../usuarios/papel-usuario.enum.js';
import { StatusPedido } from './status-pedido.enum.js';
import {
  TRANSICOES,
  validarPermissao,
  validarPreenchimento,
  validarTransicao,
} from './status-pedido.regras.js';

const S = StatusPedido;
const T = TipoCategoria;

describe('Transições de status', () => {
  it('permite o caminho feliz de um material', () => {
    expect(validarTransicao(S.SOLICITADO, S.EM_ANALISE, T.MATERIAL)).toBeNull();
    expect(validarTransicao(S.EM_ANALISE, S.APROVADO, T.MATERIAL)).toBeNull();
    expect(validarTransicao(S.APROVADO, S.ATENDIDO, T.MATERIAL)).toBeNull();
  });

  it('permite aprovar uma declaração', () => {
    expect(validarTransicao(S.EM_ANALISE, S.APROVADO, T.DOCUMENTO)).toBeNull();
  });

  it('serviço de máquina é encaminhado, não aprovado', () => {
    expect(validarTransicao(S.EM_ANALISE, S.ENCAMINHADO, T.SERVICO)).toBeNull();
    expect(validarTransicao(S.EM_ANALISE, S.APROVADO, T.SERVICO)).toMatch(
      /encaminhados, não aprovados/,
    );
  });

  it('só serviço pode ser encaminhado à Prefeitura', () => {
    expect(validarTransicao(S.EM_ANALISE, S.ENCAMINHADO, T.MATERIAL)).toMatch(
      /serviço de máquina/,
    );
    expect(
      validarTransicao(S.EM_ANALISE, S.ENCAMINHADO, T.DOCUMENTO),
    ).not.toBeNull();
  });

  it('não pula etapas', () => {
    expect(
      validarTransicao(S.SOLICITADO, S.ATENDIDO, T.MATERIAL),
    ).not.toBeNull();
    expect(
      validarTransicao(S.SOLICITADO, S.APROVADO, T.MATERIAL),
    ).not.toBeNull();
  });

  it.each([S.ATENDIDO, S.NEGADO, S.CANCELADO])(
    '%s é estado final: não sai dele',
    (final) => {
      expect(TRANSICOES[final]).toEqual([]);
      expect(validarTransicao(final, S.EM_ANALISE, T.MATERIAL)).not.toBeNull();
    },
  );

  it('cobre todos os status do enum', () => {
    expect(Object.keys(TRANSICOES).sort()).toEqual(Object.values(S).sort());
  });
});

describe('Permissão para mudar o status', () => {
  it('a Associação pode qualquer mudança', () => {
    expect(
      validarPermissao(S.APROVADO, PapelUsuario.ASSOCIACAO, false),
    ).toBeNull();
    expect(
      validarPermissao(S.NEGADO, PapelUsuario.ASSOCIACAO, false),
    ).toBeNull();
  });

  it('o morador autor pode cancelar o próprio pedido', () => {
    expect(
      validarPermissao(S.CANCELADO, PapelUsuario.MORADOR, true),
    ).toBeNull();
  });

  it('o morador não cancela pedido de outro morador', () => {
    expect(
      validarPermissao(S.CANCELADO, PapelUsuario.MORADOR, false),
    ).not.toBeNull();
  });

  it('o morador não aprova, nega nem analisa, nem o próprio pedido', () => {
    for (const status of [S.EM_ANALISE, S.APROVADO, S.NEGADO, S.ATENDIDO]) {
      expect(
        validarPermissao(status, PapelUsuario.MORADOR, true),
      ).not.toBeNull();
    }
  });
});

describe('Preenchimento por tipo de pedido', () => {
  it('material exige ao menos um item', () => {
    expect(
      validarPreenchimento({
        tipo: T.MATERIAL,
        quantidadeDeItens: 0,
        temLocalizacao: false,
      }),
    ).toHaveProperty('itens');
    expect(
      validarPreenchimento({
        tipo: T.MATERIAL,
        quantidadeDeItens: 2,
        temLocalizacao: false,
      }),
    ).toEqual({});
  });

  it('material aceita localização opcional', () => {
    expect(
      validarPreenchimento({
        tipo: T.MATERIAL,
        quantidadeDeItens: 1,
        temLocalizacao: true,
      }),
    ).toEqual({});
  });

  it('serviço exige localização e não aceita itens', () => {
    const erros = validarPreenchimento({
      tipo: T.SERVICO,
      quantidadeDeItens: 1,
      temLocalizacao: false,
    });
    expect(erros).toHaveProperty('localizacao');
    expect(erros).toHaveProperty('itens');
    expect(
      validarPreenchimento({
        tipo: T.SERVICO,
        quantidadeDeItens: 0,
        temLocalizacao: true,
      }),
    ).toEqual({});
  });

  it('declaração não aceita itens nem localização', () => {
    const erros = validarPreenchimento({
      tipo: T.DOCUMENTO,
      quantidadeDeItens: 1,
      temLocalizacao: true,
    });
    expect(Object.keys(erros).sort()).toEqual(['itens', 'localizacao']);
    expect(
      validarPreenchimento({
        tipo: T.DOCUMENTO,
        quantidadeDeItens: 0,
        temLocalizacao: false,
      }),
    ).toEqual({});
  });
});
