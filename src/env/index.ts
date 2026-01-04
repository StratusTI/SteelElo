import 'dotenv/config';
import { z } from 'zod';

const envScema = z.object({
  JWT_SECRET: z.string().min(1),
});

const _env = envScema.safeParse(process.env);

if (_env.success === false) {
  console.error('Invalid environment variables:', _env.error.format());

  throw new Error('Invalid environment variables');
}

export const env = _env.data;
