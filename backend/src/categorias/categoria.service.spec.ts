import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CategoriaService } from './categoria.service.js';

describe('CategoriaService', () => {
  const service = new CategoriaService();

  it('returns paginated categories', () => {
    const response = service.listar(1, 5);

    expect(response.count).toBe(7);
    expect(response.results).toHaveLength(5);
    expect(response.next).toBe('/api/categorias?page=2&pageSize=5');
    expect(response.previous).toBeNull();
  });

  it('returns a category by its identifier', () => {
    expect(service.buscarPorId(1)).toEqual({
      id: 1,
      nome: 'Sementes',
      tipo: 'material',
    });
  });

  it('rejects invalid pagination values', () => {
    expect(() => service.listar(0, 20)).toThrow(BadRequestException);
    expect(() => service.listar(1, 101)).toThrow(BadRequestException);
  });

  it('throws when the category does not exist', () => {
    expect(() => service.buscarPorId(999)).toThrow(NotFoundException);
  });
});
