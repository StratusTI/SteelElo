import { z } from 'zod'

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  email: z.email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']).optional(),
})

export type CreateUserDTO = z.infer<typeof CreateUserSchema>

export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100).optional(),
  email: z.email('E-mail inválido').optional(),
})

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>
