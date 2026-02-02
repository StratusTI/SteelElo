import { prismaSteel } from "@/src/lib/prisma";
import {
  CreateIntegrationParams,
  IntegrationsRepository,
  UpdateIntegrationParams,
  UserIntegration,
  UserIntegrationWithToken
} from "../integrations-repository";

export class PrismaIntegrationsRepository implements IntegrationsRepository {
  private mapToUserIntegration(integration: any): UserIntegration {
    return {
      id: integration.id,
      userId: integration.usuario_id,
      provider: integration.provider,
      providerId: integration.provider_id,
      providerLogin: integration.provider_login,
      scopes: integration.scopes,
      createdAt: integration.created_at,
      updatedAt: integration.updated_at,
    }
  }

  private mapToUserIntegrationWithToken(integration: any): UserIntegrationWithToken {
    return {
      ...this.mapToUserIntegration(integration),
      accessToken: integration.access_token,
      refreshToken: integration.refresh_token,
      tokenExpires: integration.token_expires,
    }
  }

  async findByUserAndProvider(userId: number, provider: string): Promise<UserIntegrationWithToken | null> {
    const integration = await prismaSteel.integracao_usuario.findUnique({
      where: {
        usuario_id_provider: {
          usuario_id: userId,
          provider,
        }
      }
    })

    if (!integration) return null

    return this.mapToUserIntegrationWithToken(integration)
  }

  async findAllByUser(userId: number): Promise<UserIntegration[]> {
    const integrations = await prismaSteel.integracao_usuario.findMany({
      where: { usuario_id: userId },
      orderBy: { created_at: 'desc' }
    })

    return integrations.map(i => this.mapToUserIntegration(i))
  }

  async create(params: CreateIntegrationParams): Promise<UserIntegration> {
    const integration = await prismaSteel.integracao_usuario.create({
      data: {
        usuario_id: params.userId,
        provider: params.provider,
        provider_id: params.providerId,
        provider_login: params.providerLogin,
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
        token_expires: params.tokenExpires,
        scopes: params.scopes,
      }
    })

    return this.mapToUserIntegration(integration)
  }

  async update(params: UpdateIntegrationParams): Promise<UserIntegration | null> {
    const updateData: any = {}

    if (params.accessToken !== undefined) updateData.access_token = params.accessToken
    if (params.refreshToken !== undefined) updateData.refresh_token = params.refreshToken
    if (params.tokenExpires !== undefined) updateData.token_expires = params.tokenExpires
    if (params.providerLogin !== undefined) updateData.provider_login = params.providerLogin
    if (params.scopes !== undefined) updateData.scopes = params.scopes

    try {
      const integration = await prismaSteel.integracao_usuario.update({
        where: {
          usuario_id_provider: {
            usuario_id: params.userId,
            provider: params.provider,
          }
        },
        data: updateData
      })

      return this.mapToUserIntegration(integration)
    } catch {
      return null
    }
  }

  async delete(userId: number, provider: string): Promise<boolean> {
    try {
      await prismaSteel.integracao_usuario.delete({
        where: {
          usuario_id_provider: {
            usuario_id: userId,
            provider,
          }
        }
      })
      return true
    } catch {
      return false
    }
  }
}
