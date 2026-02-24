export interface UserDTO {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: string
  workspaceId: string | null
  createdAt: string
}
