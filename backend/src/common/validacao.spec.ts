import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ListarPedidosDto, CriarPedidoDto } from '../pedidos/pedido.dto.js';
import { erroDeValidacao } from './filtro-de-excecoes.js';
import { montarPagina, deslocamento, PaginacaoDto } from './paginacao.js';

// O mesmo pipe configurado no main.ts.
const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: erroDeValidacao,
});

async function validar<T>(
  metatype: new () => T,
  valor: unknown,
  type: 'body' | 'query' = 'body',
) {
  return pipe.transform(valor, { type, metatype });
}

async function erroDe<T>(
  metatype: new () => T,
  valor: unknown,
  type: 'body' | 'query' = 'body',
) {
  try {
    await validar(metatype, valor, type);
  } catch (e) {
    expect(e).toBeInstanceOf(BadRequestException);
    return (e as BadRequestException).getResponse() as Record<string, string[]>;
  }
  throw new Error('Era esperado um erro de validação');
}

const pedidoValido = {
  autorId: 1,
  categoriaId: 1,
  titulo: 'Sementes',
  itens: [{ itemId: 1, quantidade: 20 }],
};

describe('Validação dos DTOs (ValidationPipe)', () => {
  it('aceita um pedido válido', async () => {
    const dto = await validar(CriarPedidoDto, pedidoValido);
    expect(dto.titulo).toBe('Sementes');
  });

  it('devolve { campo: [mensagens] } para campos obrigatórios ausentes', async () => {
    const erros = await erroDe(CriarPedidoDto, {});
    expect(Object.keys(erros)).toEqual(
      expect.arrayContaining(['autorId', 'categoriaId', 'titulo']),
    );
    expect(Array.isArray(erros.titulo)).toBe(true);
  });

  it('rejeita campo não declarado (whitelist)', async () => {
    const erros = await erroDe(CriarPedidoDto, {
      ...pedidoValido,
      admin: true,
    });
    expect(erros).toHaveProperty('admin');
  });

  it('aponta o caminho do erro em itens aninhados', async () => {
    const erros = await erroDe(CriarPedidoDto, {
      ...pedidoValido,
      itens: [{ itemId: 1, quantidade: -3 }],
    });
    expect(erros).toHaveProperty(['itens.0.quantidade']);
  });

  it('valida a faixa da localização', async () => {
    const erros = await erroDe(CriarPedidoDto, {
      ...pedidoValido,
      localizacao: { latitude: 120, longitude: 0 },
    });
    expect(erros).toHaveProperty(['localizacao.latitude']);
  });

  it('exige a data no formato AAAA-MM-DD', async () => {
    const erros = await erroDe(CriarPedidoDto, {
      ...pedidoValido,
      dataDesejada: '15/12/2026',
    });
    expect(erros).toHaveProperty('dataDesejada');
  });
});

describe('Mensagens de validação em português', () => {
  it('campo ausente tem uma única mensagem de obrigatório', async () => {
    const erros = await erroDe(CriarPedidoDto, {});
    expect(erros.titulo).toEqual(['Este campo é obrigatório.']);
    expect(erros.categoriaId).toEqual(['Este campo é obrigatório.']);
  });

  it('traduz tipo, tamanho, faixa e valor positivo', async () => {
    const erros = await erroDe(CriarPedidoDto, {
      ...pedidoValido,
      titulo: 'x'.repeat(121),
      categoriaId: 'abc',
      itens: [{ itemId: 1, quantidade: -3 }],
    });
    expect(erros.titulo).toEqual(['Use no máximo 120 caracteres.']);
    expect(erros.categoriaId).toContain('Deve ser um número inteiro.');
    expect(erros['itens.0.quantidade']).toEqual(['Deve ser maior que zero.']);
  });

  it('traduz a faixa da localização e o campo não permitido', async () => {
    const erros = await erroDe(CriarPedidoDto, {
      ...pedidoValido,
      admin: true,
      localizacao: { latitude: 120, longitude: 0 },
    });
    expect(erros['localizacao.latitude']).toEqual(['Deve ser no máximo 90.']);
    expect(erros.admin).toEqual(['Campo não permitido.']);
  });

  it('mantém a mensagem que o DTO já escreveu em português', async () => {
    const erros = await erroDe(CriarPedidoDto, {
      ...pedidoValido,
      dataDesejada: '15/12/2026',
    });
    expect(erros.dataDesejada).toContain('Use o formato AAAA-MM-DD.');
  });

  it('lista os valores aceitos de um enum', async () => {
    const erros = await erroDe(ListarPedidosDto, { status: 'voando' }, 'query');
    expect(erros.status[0]).toMatch(
      /^Valor inválido\. Valores aceitos: solicitado,/,
    );
  });
});

describe('Paginação', () => {
  it('usa página 1 e 20 itens por padrão e converte a query string', async () => {
    const filtros = await validar(ListarPedidosDto, {}, 'query');
    expect(filtros.page).toBe(1);
    expect(filtros.pageSize).toBe(20);
    expect(filtros.ordering).toBe('-dataCriacao');

    const comValores = await validar(
      ListarPedidosDto,
      { page: '3', pageSize: '10' },
      'query',
    );
    expect(comValores.page).toBe(3);
    expect(comValores.pageSize).toBe(10);
  });

  it('recusa tamanho de página acima do teto de 100', async () => {
    const erros = await erroDe(ListarPedidosDto, { pageSize: '1000' }, 'query');
    expect(erros).toHaveProperty('pageSize');
  });

  it('recusa página zero e ordenação desconhecida', async () => {
    expect(
      await erroDe(ListarPedidosDto, { page: '0' }, 'query'),
    ).toHaveProperty('page');
    expect(
      await erroDe(ListarPedidosDto, { ordering: 'senha' }, 'query'),
    ).toHaveProperty('ordering');
  });

  it('calcula deslocamento e total de páginas', () => {
    const p = Object.assign(new PaginacaoDto(), { page: 3, pageSize: 10 });
    expect(deslocamento(p)).toBe(20);
    const pagina = montarPagina(['a'], 25, p);
    expect(pagina).toMatchObject({
      count: 25,
      page: 3,
      pageSize: 10,
      totalPages: 3,
    });
    expect(montarPagina([], 0, p).totalPages).toBe(1);
  });
});
