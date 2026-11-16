import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../categorias/categoria.entity.js';
import { contador } from '../common/contador-de-consultas.js';
import { PedidoItem } from '../pedidos/pedido-item.entity.js';
import { Pedido } from '../pedidos/pedido.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';

export interface Medicao {
  versao: 'ruim' | 'boa';
  pedidos: number;
  consultas: number;
  tempoMs: number;
}

// SÓ PARA ESTUDO (E2/E06.2): reproduz o N+1 de propósito e mede.
// Só é carregado com DIAGNOSTICO=true e não aparece no Swagger.
@Injectable()
export class DiagnosticoService {
  constructor(
    @InjectRepository(Pedido) private readonly pedidos: Repository<Pedido>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    @InjectRepository(Categoria)
    private readonly categorias: Repository<Categoria>,
    @InjectRepository(PedidoItem)
    private readonly linhas: Repository<PedidoItem>,
  ) {}

  // Versão RUIM: 1 consulta para a lista + 3 por pedido dentro do laço.
  async ruim(tamanho: number): Promise<Medicao> {
    return this.medir('ruim', async () => {
      const lista = await this.pedidos.find({
        order: { id: 'ASC' },
        take: tamanho,
      });
      const resposta: unknown[] = [];
      for (const p of lista) {
        const autor = await this.usuarios.findOneByOrFail({ id: p.autorId });
        const categoria = await this.categorias.findOneByOrFail({
          id: p.categoriaId,
        });
        const linhas = await this.linhas.find({
          where: { pedidoId: p.id },
          relations: { item: true },
        });
        resposta.push({
          id: p.id,
          titulo: p.titulo,
          autor: autor.nome,
          categoria: categoria.nome,
          itens: linhas.map((l) => l.item.nome),
        });
      }
      return resposta.length;
    });
  }

  // Versão BOA: as relações vêm na própria consulta (relations/join).
  async boa(tamanho: number): Promise<Medicao> {
    return this.medir('boa', async () => {
      const lista = await this.pedidos.find({
        relations: { autor: true, categoria: true, itens: { item: true } },
        order: { id: 'ASC' },
        take: tamanho,
      });
      return lista.length;
    });
  }

  private async medir(
    versao: Medicao['versao'],
    executar: () => Promise<number>,
  ): Promise<Medicao> {
    const antes = contador.consultas;
    const inicio = performance.now();
    const pedidos = await executar();
    return {
      versao,
      pedidos,
      consultas: contador.consultas - antes,
      tempoMs: Math.round((performance.now() - inicio) * 100) / 100,
    };
  }
}
