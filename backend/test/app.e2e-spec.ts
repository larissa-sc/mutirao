import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import {
  configurarApp,
  configurarDocumentacao,
} from '../src/configurar-app.js';
import { Usuario } from '../src/usuarios/usuario.entity.js';
import { PapelUsuario } from '../src/usuarios/papel-usuario.enum.js';

// Teste de ponta a ponta contra o PostgreSQL real:
//   docker compose up -d && npm run migration:run -w backend
//   npm run test:e2e -w backend
describe('API (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  const sufixo = Date.now().toString(36);
  let morador: Usuario;
  let associacao: Usuario;
  const criados = {
    categorias: [] as number[],
    itens: [] as number[],
    pedidos: [] as number[],
  };

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    configurarApp(app);
    configurarDocumentacao(app);
    await app.init();
    ds = app.get(DataSource);

    const usuarios = ds.getRepository(Usuario);
    morador = await usuarios.save(
      usuarios.create({
        firebaseUid: `e2e-m-${sufixo}`,
        nome: 'Morador E2E',
        email: `m-${sufixo}@e2e.local`,
        papel: PapelUsuario.MORADOR,
      }),
    );
    associacao = await usuarios.save(
      usuarios.create({
        firebaseUid: `e2e-a-${sufixo}`,
        nome: 'Associação E2E',
        email: `a-${sufixo}@e2e.local`,
        papel: PapelUsuario.ASSOCIACAO,
      }),
    );
  });

  afterAll(async () => {
    // Limpa o que o teste criou (pedidos primeiro, por causa das chaves).
    if (criados.pedidos.length)
      await ds.query('DELETE FROM pedidos WHERE id = ANY($1)', [
        criados.pedidos,
      ]);
    if (criados.itens.length)
      await ds.query('DELETE FROM itens WHERE id = ANY($1)', [criados.itens]);
    if (criados.categorias.length)
      await ds.query('DELETE FROM categorias WHERE id = ANY($1)', [
        criados.categorias,
      ]);
    await ds.query(
      'DELETE FROM historico_status WHERE "responsavelId" = ANY($1)',
      [[morador.id, associacao.id]],
    );
    await ds.getRepository(Usuario).delete([morador.id, associacao.id]);
    await app.close();
  });

  it('GET /api/health responde 200 com o banco', async () => {
    const r = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(r.body).toEqual({ status: 'ok', banco: 'ok' });
  });

  it('CRUD de categorias: 201, 409, 400, 200, 204, 404', async () => {
    const http = request(app.getHttpServer());
    const nome = `Categoria E2E ${sufixo}`;

    const criada = await http
      .post('/api/categorias')
      .send({ nome, tipo: 'material' })
      .expect(201);
    criados.categorias.push(criada.body.id);

    await http
      .post('/api/categorias')
      .send({ nome, tipo: 'material' })
      .expect(409);
    const invalida = await http
      .post('/api/categorias')
      .send({ nome: '', tipo: 'outro' })
      .expect(400);
    expect(Object.keys(invalida.body)).toEqual(
      expect.arrayContaining(['nome', 'tipo']),
    );

    await http
      .patch(`/api/categorias/${criada.body.id}`)
      .send({ nome: `${nome} editada` })
      .expect(200);
    await http.get(`/api/categorias/${criada.body.id}`).expect(200);
    await http.delete(`/api/categorias/${criada.body.id}`).expect(204);
    await http.get(`/api/categorias/${criada.body.id}`).expect(404);
  });

  it('CRUD de itens e listagem paginada com teto de tamanho', async () => {
    const http = request(app.getHttpServer());
    const criado = await http
      .post('/api/itens')
      .send({ nome: `Item E2E ${sufixo}`, unidadePadrao: 'kg' })
      .expect(201);
    criados.itens.push(criado.body.id);

    const pagina = await http.get('/api/itens?page=1&pageSize=2').expect(200);
    expect(pagina.body).toMatchObject({ page: 1, pageSize: 2 });
    expect(pagina.body.results.length).toBeLessThanOrEqual(2);

    await http.get('/api/itens?pageSize=1000').expect(400);
    await http
      .post('/api/itens')
      .send({ nome: 'x', unidadePadrao: 'kg', admin: true })
      .expect(400);
  });

  it('pedido de material: cria com itens, filtra, altera, e não apaga fora de "solicitado"', async () => {
    const http = request(app.getHttpServer());
    const cat = await http
      .post('/api/categorias')
      .send({ nome: `Mat E2E ${sufixo}`, tipo: 'material' })
      .expect(201);
    criados.categorias.push(cat.body.id);
    const item = await http
      .post('/api/itens')
      .send({ nome: `Semente E2E ${sufixo}`, unidadePadrao: 'kg' })
      .expect(201);
    criados.itens.push(item.body.id);

    await http
      .post('/api/pedidos')
      .send({
        autorId: morador.id,
        categoriaId: cat.body.id,
        titulo: 'Sem itens',
      })
      .expect(400);

    const pedido = await http
      .post('/api/pedidos')
      .send({
        autorId: morador.id,
        categoriaId: cat.body.id,
        titulo: 'Sementes E2E',
        itens: [{ itemId: item.body.id, quantidade: 12.5 }],
      })
      .expect(201);
    criados.pedidos.push(pedido.body.id);
    expect(pedido.body).toMatchObject({
      status: 'solicitado',
      autor: { id: morador.id },
    });
    expect(pedido.body.itens[0]).toMatchObject({
      quantidade: 12.5,
      unidade: 'kg',
    });

    const filtrado = await http
      .get(`/api/pedidos?autorId=${morador.id}&status=solicitado&tipo=material`)
      .expect(200);
    expect(filtrado.body.count).toBe(1);

    await http
      .patch(`/api/pedidos/${pedido.body.id}`)
      .send({ titulo: 'Sementes E2E (editado)' })
      .expect(200);

    await http
      .patch(`/api/pedidos/${pedido.body.id}/status`)
      .send({ status: 'emAnalise', responsavelId: associacao.id })
      .expect(200);
    await http
      .patch(`/api/pedidos/${pedido.body.id}`)
      .send({ titulo: 'tarde demais' })
      .expect(409);
    await http.delete(`/api/pedidos/${pedido.body.id}`).expect(409);
  });

  it('status: morador não analisa (403), transição inválida (400), motivo obrigatório ao negar, histórico registrado', async () => {
    const http = request(app.getHttpServer());
    const cat = await http
      .post('/api/categorias')
      .send({ nome: `Serv E2E ${sufixo}`, tipo: 'servico' })
      .expect(201);
    criados.categorias.push(cat.body.id);

    const pedido = await http
      .post('/api/pedidos')
      .send({
        autorId: morador.id,
        categoriaId: cat.body.id,
        titulo: 'Patrol E2E',
        localizacao: { latitude: -8.1, longitude: -34.9 },
      })
      .expect(201);
    criados.pedidos.push(pedido.body.id);
    const base = `/api/pedidos/${pedido.body.id}`;

    await http
      .patch(`${base}/status`)
      .send({ status: 'emAnalise', responsavelId: morador.id })
      .expect(403);
    await http
      .patch(`${base}/status`)
      .send({ status: 'atendido', responsavelId: associacao.id })
      .expect(400);
    await http
      .patch(`${base}/status`)
      .send({ status: 'emAnalise', responsavelId: associacao.id })
      .expect(200);
    await http
      .patch(`${base}/status`)
      .send({ status: 'aprovado', responsavelId: associacao.id })
      .expect(400);
    await http
      .patch(`${base}/status`)
      .send({ status: 'negado', responsavelId: associacao.id })
      .expect(400);
    await http
      .patch(`${base}/status`)
      .send({
        status: 'encaminhado',
        responsavelId: associacao.id,
        observacao: 'Ofício enviado.',
      })
      .expect(200);

    const historico = await http.get(`${base}/historico`).expect(200);
    expect(
      historico.body.map((h: { statusNovo: string }) => h.statusNovo),
    ).toEqual(['solicitado', 'emAnalise', 'encaminhado']);
  });

  it('pedido de serviço exige localização e o morador cancela o próprio pedido', async () => {
    const http = request(app.getHttpServer());
    const cat = await http
      .post('/api/categorias')
      .send({ nome: `Trator E2E ${sufixo}`, tipo: 'servico' })
      .expect(201);
    criados.categorias.push(cat.body.id);

    const semLocal = await http
      .post('/api/pedidos')
      .send({
        autorId: morador.id,
        categoriaId: cat.body.id,
        titulo: 'Sem local',
      })
      .expect(400);
    expect(semLocal.body).toHaveProperty('localizacao');

    const pedido = await http
      .post('/api/pedidos')
      .send({
        autorId: morador.id,
        categoriaId: cat.body.id,
        titulo: 'Trator E2E',
        localizacao: { latitude: -8, longitude: -35 },
      })
      .expect(201);
    criados.pedidos.push(pedido.body.id);

    const cancelado = await http
      .patch(`/api/pedidos/${pedido.body.id}/status`)
      .send({ status: 'cancelado', responsavelId: morador.id })
      .expect(200);
    expect(cancelado.body.status).toBe('cancelado');
    await http.get('/api/pedidos/99999999').expect(404);
  });

  it('serve o Swagger e o schema OpenAPI com as rotas dos três recursos', async () => {
    const http = request(app.getHttpServer());
    await http.get('/api/docs').expect(200);
    const schema = await http.get('/api/openapi.json').expect(200);
    expect(Object.keys(schema.body.paths)).toEqual(
      expect.arrayContaining([
        '/api/pedidos',
        '/api/pedidos/{id}/status',
        '/api/categorias',
        '/api/itens',
        '/api/health',
      ]),
    );
  });
});
