import 'dotenv/config';
import { z } from 'zod';

// Define and validate all environment variables in one place.
const environmentSchema = z.object({
  // Required PostgreSQL connection string.
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid URL')
    .refine(
      (value) =>
        value.startsWith('postgresql://') ||
        value.startsWith('postgres://'),
      'DATABASE_URL must use the PostgreSQL protocol',
    ),

  // Use port 4000 when PORT is not provided.
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  // Identify the current application environment.
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Secret used to sign and verify access JWTs.
  // Require at least 32 bytes of entropy-bearing secret material.
  JWT_ACCESS_SECRET: z
    .string()
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') >= 32,
      'JWT_ACCESS_SECRET must be at least 32 bytes',
    ),

  // Keep access tokens short-lived to limit exposure if compromised.
  JWT_ACCESS_TTL: z
    .enum(['5m', '10m', '15m', '30m'])
    .default('15m'),
});

// Validate process.env when this module is imported.
const result = environmentSchema.safeParse(process.env);

if (!result.success) {
  // Display field names and validation messages, never secret values.
  const errors = result.error.issues
    .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  throw new Error(`Environment configuration is invalid:\n${errors}`);
}

// Export validated, typed configuration for the entire application.
export const env = result.data;
