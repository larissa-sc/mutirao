import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configurarApp } from './../src/configurar-app.js';

describe('Categorias API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarApp(app);
    await app.init();
  });

  it('/api/categorias (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/categorias')
      .expect(200)
      .expect(({ body }) => {
        expect(body.count).toBe(7);
        expect(body.results[0]).toEqual({
          id: 1,
          nome: 'Sementes',
          tipo: 'material',
        });
      });
  });

  it('/api/categorias/:id rejects non-numeric identifiers', () => {
    return request(app.getHttpServer()).get('/api/categorias/abc').expect(400);
  });

  it('/api/categorias/:id returns 404 for an unknown category', () => {
    return request(app.getHttpServer())
      .get('/api/categorias/999')
      .expect(404)
      .expect({
        detail: 'Categoria 999 não encontrada.',
      });
  });

  it('/api/docs serves the Swagger UI', () => {
    return request(app.getHttpServer()).get('/api/docs').expect(200);
  });

  it('/api/docs-json describes the implemented routes', () => {
    return request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200)
      .expect(({ body }) => {
        expect(body.paths).toHaveProperty('/api/categorias');
        expect(body.paths).toHaveProperty('/api/categorias/{id}');
        expect(body.paths).not.toHaveProperty('/api');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
