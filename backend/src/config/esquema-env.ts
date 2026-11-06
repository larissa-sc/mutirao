import { z } from 'zod';

const urlOpcional = z.preprocess(
  (value: unknown) => (value === '' ? undefined : value),
  z
    .string()
    .url()
    .refine(
      (value) => /^postgres(?:ql)?:\/\//i.test(value),
      'DATABASE_URL deve usar o protocolo postgres ou postgresql.',
    )
    .optional(),
);

export const esquemaEnv = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: urlOpcional,
    DB_SSL: z.enum(['true', 'false']).default('false'),
    DB_SYNC: z.enum(['true', 'false']).default('false'),
  })
  .passthrough();

export function validarEnv(bruto: Record<string, unknown>) {
  const resultado = esquemaEnv.safeParse(bruto);

  if (!resultado.success) {
    const problemas = resultado.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`,
    );
    throw new Error(
      `Variáveis de ambiente inválidas:\n${problemas.join('\n')}`,
    );
  }

  return resultado.data;
}
