import { z } from 'zod';

export const searchUsersSchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters').optional(),
  excludeProjectId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
