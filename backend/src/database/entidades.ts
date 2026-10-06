import { Categoria } from '../categorias/categoria.entity.js';
import { HistoricoStatus } from '../pedidos/historico-status.entity.js';
import { Localizacao } from '../pedidos/localizacao.entity.js';
import { Pedido } from '../pedidos/pedido.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';

export const ENTIDADES = [
  Usuario,
  Categoria,
  Localizacao,
  Pedido,
  HistoricoStatus,
];
