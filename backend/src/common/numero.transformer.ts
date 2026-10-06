import type { ValueTransformer } from 'typeorm';

// O Postgres devolve `numeric` como string; a API trabalha com number.
export const numeroTransformer: ValueTransformer = {
  to: (valor?: number | null) => valor,
  from: (valor?: string | null) =>
    valor === null || valor === undefined ? null : Number(valor),
};
