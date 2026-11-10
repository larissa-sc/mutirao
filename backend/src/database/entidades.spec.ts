import 'reflect-metadata';
import { DataSource, type EntityMetadata } from 'typeorm';
import { Categoria } from '../categorias/categoria.entity.js';
import { TipoCategoria } from '../categorias/tipo-categoria.enum.js';
import { Item } from '../itens/item.entity.js';
import { HistoricoStatus } from '../pedidos/historico-status.entity.js';
import { Localizacao } from '../pedidos/localizacao.entity.js';
import { PedidoItem } from '../pedidos/pedido-item.entity.js';
import { Pedido } from '../pedidos/pedido.entity.js';
import { StatusPedido } from '../pedidos/status-pedido.enum.js';
import { PapelUsuario } from '../usuarios/papel-usuario.enum.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { ENTIDADES } from './entidades.js';

// Monta o modelo das entidades sem conectar a nenhum banco.
async function montarMetadados(): Promise<DataSource> {
  const ds = new DataSource({ type: 'postgres', entities: ENTIDADES });
  await (ds as unknown as { buildMetadatas(): Promise<void> }).buildMetadatas();
  return ds;
}

function relacao(meta: EntityMetadata, propriedade: string) {
  const r = meta.relations.find((x) => x.propertyName === propriedade);
  if (!r) throw new Error(`Relação ${propriedade} não encontrada`);
  return r;
}

function colunasUnicas(meta: EntityMetadata): string[] {
  return meta.uniques.flatMap((u) => u.columns.map((c) => c.propertyName));
}

describe('Entidades do domínio', () => {
  let ds: DataSource;

  beforeAll(async () => {
    ds = await montarMetadados();
  });

  it('registra as sete entidades com as tabelas esperadas', () => {
    const tabelas = ds.entityMetadatas.map((m) => m.tableName).sort();
    expect(tabelas).toEqual([
      'categorias',
      'historico_status',
      'itens',
      'localizacoes',
      'pedido_itens',
      'pedidos',
      'usuarios',
    ]);
  });

  describe('Usuario', () => {
    it('tem firebaseUid e email únicos e papel morador por padrão', () => {
      const meta = ds.getMetadata(Usuario);
      expect(colunasUnicas(meta)).toEqual(
        expect.arrayContaining(['firebaseUid', 'email']),
      );
      expect(meta.findColumnWithPropertyName('papel')?.default).toBe(
        PapelUsuario.MORADOR,
      );
    });

    it('não guarda senha', () => {
      const colunas = ds
        .getMetadata(Usuario)
        .columns.map((c) => c.propertyName);
      expect(colunas).not.toContain('senha');
      expect(colunas).not.toContain('senhaHash');
    });

    it('faz muitos pedidos e muitas alterações de status', () => {
      const meta = ds.getMetadata(Usuario);
      expect(relacao(meta, 'pedidos').relationType).toBe('one-to-many');
      expect(relacao(meta, 'alteracoesDeStatus').relationType).toBe(
        'one-to-many',
      );
    });
  });

  describe('Categoria e Item', () => {
    it('categoria tem nome único e tipo material, servico ou documento', () => {
      const meta = ds.getMetadata(Categoria);
      expect(colunasUnicas(meta)).toContain('nome');
      expect(meta.findColumnWithPropertyName('tipo')?.enum).toEqual(
        Object.values(TipoCategoria),
      );
    });

    it('item tem nome único e unidade padrão obrigatória', () => {
      const meta = ds.getMetadata(Item);
      expect(colunasUnicas(meta)).toContain('nome');
      expect(meta.findColumnWithPropertyName('unidadePadrao')?.isNullable).toBe(
        false,
      );
    });
  });

  describe('Pedido', () => {
    it('pertence a uma categoria e a um autor, ambos obrigatórios e com RESTRICT', () => {
      const meta = ds.getMetadata(Pedido);
      const categoria = relacao(meta, 'categoria');
      const autor = relacao(meta, 'autor');
      expect(categoria.relationType).toBe('many-to-one');
      expect(categoria.inverseEntityMetadata.target).toBe(Categoria);
      expect(categoria.isNullable).toBe(false);
      expect(categoria.onDelete).toBe('RESTRICT');
      expect(autor.relationType).toBe('many-to-one');
      expect(autor.inverseEntityMetadata.target).toBe(Usuario);
      expect(autor.isNullable).toBe(false);
      expect(autor.onDelete).toBe('RESTRICT');
    });

    it('tem localização 1:1 opcional, guardando a chave no pedido', () => {
      const loc = relacao(ds.getMetadata(Pedido), 'localizacao');
      expect(loc.relationType).toBe('one-to-one');
      expect(loc.inverseEntityMetadata.target).toBe(Localizacao);
      expect(loc.isNullable).toBe(true);
      expect(loc.isOwning).toBe(true);
    });

    it('começa com status solicitado e aceita os sete status do contrato', () => {
      const status = ds
        .getMetadata(Pedido)
        .findColumnWithPropertyName('status');
      expect(status?.default).toBe(StatusPedido.SOLICITADO);
      expect(status?.enum).toEqual([
        'solicitado',
        'emAnalise',
        'aprovado',
        'encaminhado',
        'atendido',
        'negado',
        'cancelado',
      ]);
    });

    it('exige título e deixa descrição e data desejada opcionais', () => {
      const meta = ds.getMetadata(Pedido);
      expect(meta.findColumnWithPropertyName('titulo')?.isNullable).toBe(false);
      for (const campo of ['descricao', 'dataDesejada']) {
        expect(meta.findColumnWithPropertyName(campo)?.isNullable).toBe(true);
      }
    });

    it('possui histórico de status', () => {
      const historico = relacao(ds.getMetadata(Pedido), 'historico');
      expect(historico.relationType).toBe('one-to-many');
      expect(historico.inverseEntityMetadata.target).toBe(HistoricoStatus);
    });
  });

  describe('N-N entre Pedido e Item (tabela PedidoItem)', () => {
    it('o pedido tem várias linhas e o item aparece em várias linhas', () => {
      expect(relacao(ds.getMetadata(Pedido), 'itens').relationType).toBe(
        'one-to-many',
      );
      expect(relacao(ds.getMetadata(Item), 'pedidos').relationType).toBe(
        'one-to-many',
      );
      const meta = ds.getMetadata(PedidoItem);
      expect(relacao(meta, 'pedido').inverseEntityMetadata.target).toBe(Pedido);
      expect(relacao(meta, 'item').inverseEntityMetadata.target).toBe(Item);
    });

    it('a linha some com o pedido (CASCADE), mas o item do catálogo é protegido (RESTRICT)', () => {
      const meta = ds.getMetadata(PedidoItem);
      expect(relacao(meta, 'pedido').onDelete).toBe('CASCADE');
      expect(relacao(meta, 'item').onDelete).toBe('RESTRICT');
    });

    it('não repete o mesmo item no mesmo pedido', () => {
      const meta = ds.getMetadata(PedidoItem);
      const unico = meta.uniques.find((u) => u.columns.length === 2);
      expect(unico?.columns.map((c) => c.propertyName).sort()).toEqual([
        'itemId',
        'pedidoId',
      ]);
    });

    it('exige quantidade maior que zero (CHECK)', () => {
      const meta = ds.getMetadata(PedidoItem);
      expect(meta.checks.map((c) => c.expression)).toContain(
        '"quantidade" > 0',
      );
    });
  });

  describe('Localizacao', () => {
    it('limita latitude e longitude por CHECK', () => {
      const expressoes = ds
        .getMetadata(Localizacao)
        .checks.map((c) => c.expression);
      expect(expressoes).toEqual(
        expect.arrayContaining([
          '"latitude" BETWEEN -90 AND 90',
          '"longitude" BETWEEN -180 AND 180',
        ]),
      );
    });
  });

  describe('HistoricoStatus', () => {
    it('liga o pedido e o responsável, e apaga junto com o pedido', () => {
      const meta = ds.getMetadata(HistoricoStatus);
      const pedido = relacao(meta, 'pedido');
      const responsavel = relacao(meta, 'responsavel');
      expect(pedido.inverseEntityMetadata.target).toBe(Pedido);
      expect(pedido.onDelete).toBe('CASCADE');
      expect(responsavel.inverseEntityMetadata.target).toBe(Usuario);
      expect(responsavel.isNullable).toBe(false);
    });

    it('aceita statusAnterior nulo no primeiro registro', () => {
      const meta = ds.getMetadata(HistoricoStatus);
      expect(
        meta.findColumnWithPropertyName('statusAnterior')?.isNullable,
      ).toBe(true);
      expect(meta.findColumnWithPropertyName('statusNovo')?.isNullable).toBe(
        false,
      );
    });
  });
});
