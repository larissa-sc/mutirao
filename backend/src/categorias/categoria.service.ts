import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TipoCategoria } from './tipo-categoria.enum.js';
import { CategoriaResponse, ListaCategoriasResponse } from './categoria.dto.js';

@Injectable()
export class CategoriaService {
  // Fonte temporária até a lista inicial ser carregada pelo banco de dados.
  private readonly categorias: CategoriaResponse[] = [
    { id: 1, nome: 'Sementes', tipo: TipoCategoria.MATERIAL },
    { id: 2, nome: 'Adubo', tipo: TipoCategoria.MATERIAL },
    { id: 3, nome: 'Ferramentas', tipo: TipoCategoria.MATERIAL },
    { id: 4, nome: 'Serviço de trator', tipo: TipoCategoria.SERVICO },
    { id: 5, nome: 'Serviço de patrol', tipo: TipoCategoria.SERVICO },
    { id: 6, nome: 'Declaração', tipo: TipoCategoria.DOCUMENTO },
    { id: 7, nome: 'Outros', tipo: TipoCategoria.MATERIAL },
  ];

  listar(page: number, pageSize: number): ListaCategoriasResponse {
    if (page < 1) {
      throw new BadRequestException({ page: ['Deve ser maior ou igual a 1.'] });
    }

    if (pageSize < 1 || pageSize > 100) {
      throw new BadRequestException({
        pageSize: ['Deve estar entre 1 e 100.'],
      });
    }

    const start = (page - 1) * pageSize;
    const results = this.categorias.slice(start, start + pageSize);

    return {
      count: this.categorias.length,
      next:
        start + pageSize < this.categorias.length
          ? `/api/categorias?page=${page + 1}&pageSize=${pageSize}`
          : null,
      previous:
        page > 1
          ? `/api/categorias?page=${page - 1}&pageSize=${pageSize}`
          : null,
      results,
    };
  }

  buscarPorId(id: number): CategoriaResponse {
    const categoria = this.categorias.find((item) => item.id === id);

    if (!categoria) {
      throw new NotFoundException({
        detail: `Categoria ${id} não encontrada.`,
      });
    }

    return categoria;
  }
}
