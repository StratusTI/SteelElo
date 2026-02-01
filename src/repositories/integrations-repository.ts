export interface UserIntegration {
  id: number
  userId: number
  provider: string
  providerId: string
  providerLogin: string | null
  scopes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserIntegrationWithToken extends UserIntegration {
  accessToken: string
  refreshToken: string | null
  tokenExpires: Date | null
}

export interface CreateIntegrationParams {
  userId: number
  provider: string
  providerId: string
  providerLogin?: string
  accessToken: string
  refreshToken?: string
  tokenExpires?: Date
  scopes?: string
}

export interface UpdateIntegrationParams {
  userId: number
  provider: string
  accessToken?: string
  refreshToken?: string
  tokenExpires?: Date
  providerLogin?: string
  scopes?: string
}

export interface IntegrationsRepository {
  findByUserAndProvider(userId: number, provider: string): Promise<UserIntegrationWithToken | null>
  findAllByUser(userId: number): Promise<UserIntegration[]>
  create(params: CreateIntegrationParams): Promise<UserIntegration>
  update(params: UpdateIntegrationParams): Promise<UserIntegration | null>
  delete(userId: number, provider: string): Promise<boolean>
}
