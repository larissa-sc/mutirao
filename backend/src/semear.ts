/**
 * Dados de exemplo para demonstrar a API.
 *
 *     npm run migration:run   (banco vazio)
 *     npm run seed
 *
 * Pode ser executado mais de uma vez: usuários, categorias e itens são
 * criados só se ainda não existem, e os pedidos de exemplo só entram se o
 * banco ainda não tem nenhum pedido.
 *
 * Os usuários são fictícios e ficam no banco só para desenvolvimento.
 */
import { EntityManager } from 'typeorm';
import { Categoria } from './categorias/categoria.entity.js';
import { TipoCategoria } from './categorias/tipo-categoria.enum.js';
import dataSource from './data-source.js';
import { Item } from './itens/item.entity.js';
import { HistoricoStatus } from './pedidos/historico-status.entity.js';
import { Localizacao } from './pedidos/localizacao.entity.js';
import { PedidoItem } from './pedidos/pedido-item.entity.js';
import { Pedido } from './pedidos/pedido.entity.js';
import { StatusPedido } from './pedidos/status-pedido.enum.js';
import { PapelUsuario } from './usuarios/papel-usuario.enum.js';
import { Usuario } from './usuarios/usuario.entity.js';

const USUARIOS = [
  {
    firebaseUid: 'seed-associacao-1',
    nome: 'José Amaro',
    email: 'jose.amaro@exemplo.local',
    papel: PapelUsuario.ASSOCIACAO,
  },
  {
    firebaseUid: 'seed-morador-1',
    nome: 'Maria Silva',
    email: 'maria.silva@exemplo.local',
    papel: PapelUsuario.MORADOR,
  },
  {
    firebaseUid: 'seed-morador-2',
    nome: 'João Santos',
    email: 'joao.santos@exemplo.local',
    papel: PapelUsuario.MORADOR,
  },
];

const CATEGORIAS = [
  { nome: 'Sementes', tipo: TipoCategoria.MATERIAL },
  { nome: 'Adubo', tipo: TipoCategoria.MATERIAL },
  { nome: 'Ferramentas', tipo: TipoCategoria.MATERIAL },
  { nome: 'Serviço de trator', tipo: TipoCategoria.SERVICO },
  { nome: 'Serviço de patrol', tipo: TipoCategoria.SERVICO },
  { nome: 'Declaração', tipo: TipoCategoria.DOCUMENTO },
  { nome: 'Outros', tipo: TipoCategoria.MATERIAL },
];

const ITENS = [
  { nome: 'Semente de milho', unidadePadrao: 'kg' },
  { nome: 'Semente de feijão', unidadePadrao: 'kg' },
  { nome: 'Adubo orgânico', unidadePadrao: 'saco' },
  { nome: 'Adubo NPK', unidadePadrao: 'saco' },
  { nome: 'Enxada', unidadePadrao: 'unidade' },
  { nome: 'Foice', unidadePadrao: 'unidade' },
  { nome: 'Carrinho de mão', unidadePadrao: 'unidade' },
];

async function garantir<T extends { id: number }>(
  em: EntityManager,
  classe: new () => T,
  chave: keyof T,
  dados: Partial<T>[],
): Promise<Map<string, T>> {
  const mapa = new Map<string, T>();
  for (const dado of dados) {
    const valor = dado[chave] as string;
    let existente = await em.findOneBy(classe, { [chave]: valor } as never);
    if (!existente) {
      existente = await em.save(em.create(classe, dado as never) as T);
    }
    mapa.set(valor, existente);
  }
  return mapa;
}

interface PedidoExemplo {
  autor: Usuario;
  categoria: Categoria;
  titulo: string;
  descricao?: string;
  dataDesejada?: string;
  localizacao?: { latitude: number; longitude: number };
  itens?: { item: Item; quantidade: number }[];
  // Caminho de status até o estado final, feito pela Associação.
  caminho?: { status: StatusPedido; observacao?: string }[];
  responsavel: Usuario;
}

async function criarPedido(em: EntityManager, p: PedidoExemplo) {
  const pedido = await em.save(
    em.create(Pedido, {
      categoriaId: p.categoria.id,
      autorId: p.autor.id,
      titulo: p.titulo,
      descricao: p.descricao ?? null,
      dataDesejada: p.dataDesejada ?? null,
      status: StatusPedido.SOLICITADO,
      localizacao: p.localizacao ? em.create(Localizacao, p.localizacao) : null,
      itens: (p.itens ?? []).map(({ item, quantidade }) =>
        em.create(PedidoItem, {
          itemId: item.id,
          quantidade,
          unidade: item.unidadePadrao,
        }),
      ),
    }),
  );

  let anterior: StatusPedido | null = null;
  const etapas = [
    {
      status: StatusPedido.SOLICITADO,
      quem: p.autor,
      observacao: undefined as string | undefined,
    },
    ...(p.caminho ?? []).map((c) => ({
      status: c.status,
      quem: p.responsavel,
      observacao: c.observacao,
    })),
  ];
  for (const etapa of etapas) {
    await em.save(
      em.create(HistoricoStatus, {
        pedidoId: pedido.id,
        statusAnterior: anterior,
        statusNovo: etapa.status,
        observacao: etapa.observacao ?? null,
        responsavelId: etapa.quem.id,
      }),
    );
    anterior = etapa.status;
  }
  if (anterior !== StatusPedido.SOLICITADO) {
    await em.update(Pedido, { id: pedido.id }, { status: anterior! });
  }
}

async function semear() {
  await dataSource.initialize();
  console.log('Conectado. Populando...');

  await dataSource.transaction(async (em) => {
    const usuarios = await garantir(em, Usuario, 'email', USUARIOS);
    const categorias = await garantir(em, Categoria, 'nome', CATEGORIAS);
    const itens = await garantir(em, Item, 'nome', ITENS);

    if ((await em.count(Pedido)) > 0) {
      console.log('Já existem pedidos: mantidos como estão.');
      return;
    }

    const jose = usuarios.get('jose.amaro@exemplo.local')!;
    const maria = usuarios.get('maria.silva@exemplo.local')!;
    const joao = usuarios.get('joao.santos@exemplo.local')!;

    await criarPedido(em, {
      autor: maria,
      responsavel: jose,
      categoria: categorias.get('Sementes')!,
      titulo: 'Sementes para o plantio de março',
      dataDesejada: '2026-12-15',
      itens: [
        { item: itens.get('Semente de milho')!, quantidade: 20 },
        { item: itens.get('Semente de feijão')!, quantidade: 10 },
      ],
    });
    await criarPedido(em, {
      autor: joao,
      responsavel: jose,
      categoria: categorias.get('Serviço de patrol')!,
      titulo: 'Rodagem do ramal de acesso',
      descricao: 'Trecho com buracos, da porteira até a casa de farinha.',
      localizacao: { latitude: -8.124321, longitude: -34.986543 },
      caminho: [
        { status: StatusPedido.EM_ANALISE },
        {
          status: StatusPedido.ENCAMINHADO,
          observacao: 'Ofício enviado à Prefeitura.',
        },
      ],
    });
    await criarPedido(em, {
      autor: maria,
      responsavel: jose,
      categoria: categorias.get('Declaração')!,
      titulo: 'Declaração de morador',
      descricao: 'Para apresentar em banco.',
      caminho: [
        { status: StatusPedido.EM_ANALISE },
        {
          status: StatusPedido.APROVADO,
          observacao: 'Em emissão; assinatura do presidente.',
        },
        { status: StatusPedido.ATENDIDO },
      ],
    });
    await criarPedido(em, {
      autor: joao,
      responsavel: jose,
      categoria: categorias.get('Ferramentas')!,
      titulo: 'Enxadas para a roça nova',
      itens: [{ item: itens.get('Enxada')!, quantidade: 5 }],
      caminho: [
        { status: StatusPedido.EM_ANALISE },
        { status: StatusPedido.NEGADO, observacao: 'Sem estoque neste mês.' },
      ],
    });
  });

  console.log('Pronto.');
  await dataSource.destroy();
}

await semear();
