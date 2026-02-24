import type { User } from '@prisma/client'
import type { UserDTO } from '@/types/user'

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role,
    workspaceId: user.workspaceId,
    createdAt: user.createdAt.toISOString(),
  }
}
