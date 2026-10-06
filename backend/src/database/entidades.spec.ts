import 'reflect-metadata';
import { DataSource, type EntityMetadata } from 'typeorm';
import { Categoria } from '../categorias/categoria.entity.js';
import { TipoCategoria } from '../categorias/tipo-categoria.enum.js';
import { HistoricoStatus } from '../pedidos/historico-status.entity.js';
import { Localizacao } from '../pedidos/localizacao.entity.js';
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

describe('Entidades do domínio', () => {
  let ds: DataSource;

  beforeAll(async () => {
    ds = await montarMetadados();
  });

  it('registra as cinco entidades com as tabelas esperadas', () => {
    const tabelas = ds.entityMetadatas.map((m) => m.tableName).sort();
    expect(tabelas).toEqual(
      ['categorias', 'historico_status', 'localizacoes', 'pedidos', 'usuarios'],
    );
  });

  describe('Usuario', () => {
    it('tem firebaseUid e email únicos e papel morador por padrão', () => {
      const meta = ds.getMetadata(Usuario);
      const unicos = meta.uniques.flatMap((u) =>
        u.columns.map((c) => c.propertyName),
      );
      expect(unicos).toEqual(expect.arrayContaining(['firebaseUid', 'email']));
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

  describe('Categoria', () => {
    it('tem nome único e tipo material, servico ou documento', () => {
      const meta = ds.getMetadata(Categoria);
      expect(meta.uniques.flatMap((u) => u.columns.map((c) => c.propertyName)))
        .toContain('nome');
      expect(meta.findColumnWithPropertyName('tipo')?.enum).toEqual(
        Object.values(TipoCategoria),
      );
    });
  });

  describe('Pedido', () => {
    it('pertence a uma categoria e a um autor, ambos obrigatórios', () => {
      const meta = ds.getMetadata(Pedido);
      const categoria = relacao(meta, 'categoria');
      const autor = relacao(meta, 'autor');
      expect(categoria.relationType).toBe('many-to-one');
      expect(categoria.inverseEntityMetadata.target).toBe(Categoria);
      expect(categoria.isNullable).toBe(false);
      expect(autor.relationType).toBe('many-to-one');
      expect(autor.inverseEntityMetadata.target).toBe(Usuario);
      expect(autor.isNullable).toBe(false);
    });

    it('tem localização 1:1 opcional, guardando a chave no pedido', () => {
      const meta = ds.getMetadata(Pedido);
      const loc = relacao(meta, 'localizacao');
      expect(loc.relationType).toBe('one-to-one');
      expect(loc.inverseEntityMetadata.target).toBe(Localizacao);
      expect(loc.isNullable).toBe(true);
      expect(loc.isOwning).toBe(true);
    });

    it('começa com status solicitado e aceita os sete status do contrato', () => {
      const status = ds.getMetadata(Pedido).findColumnWithPropertyName('status');
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

    it('tem quantidade, unidade, descrição e data desejada opcionais', () => {
      const meta = ds.getMetadata(Pedido);
      for (const campo of [
        'quantidade',
        'unidade',
        'descricao',
        'dataDesejada',
      ]) {
        expect(meta.findColumnWithPropertyName(campo)?.isNullable).toBe(true);
      }
      expect(meta.findColumnWithPropertyName('item')?.isNullable).toBe(false);
    });

    it('possui histórico de status', () => {
      const historico = relacao(ds.getMetadata(Pedido), 'historico');
      expect(historico.relationType).toBe('one-to-many');
      expect(historico.inverseEntityMetadata.target).toBe(HistoricoStatus);
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
      expect(meta.findColumnWithPropertyName('statusAnterior')?.isNullable).toBe(
        true,
      );
      expect(meta.findColumnWithPropertyName('statusNovo')?.isNullable).toBe(
        false,
      );
    });
  });
});
