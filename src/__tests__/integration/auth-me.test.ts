import { GET } from '@/app/api/auth/me/route'
import { User } from '@/src/@types/user'
import { verifyAuth } from '@/src/auth'
import { makeGetUserProfileUseCase } from '@/src/use-cases/factories/make-get-user-profile'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/src/auth', () => ({
  verifyAuth: vi.fn(),
}))

vi.mock('@/src/use-cases/factories/make-get-user-profile', () => ({
  makeGetUserProfileUseCase: vi.fn(),
}))

describe('GET /api/auth/me', () => {
  const mockAuthUser = {
    id: 1,
    email: 'john.doe@example.com',
    admin: false,
    superadmin: false,
    enterpriseId: 1,
  }

  const mockUser: User = {
    id: 1,
    nome: 'John',
    sobrenome: 'Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    foto: 'https://example.com/photo.jpg',
    telefone: '11999999999',
    admin: false,
    superadmin: false,
    idempresa: 1,
    empresa: 'Acme Inc',
    departamento: 'Engineering',
    time: 'Backend',
    online: true,
  }

  const mockGetUserProfileUseCase = {
    execute: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(makeGetUserProfileUseCase).mockReturnValue(
      mockGetUserProfileUseCase as any
    )
  })

  it('should return 401 when token is not provided', async () => {
    vi.mocked(verifyAuth).mockResolvedValue({
      user: null,
      error: Response?.json(
        {
          success: false,
          statusCode: 401,
          message: 'Authentication token not found',
          error: { code: 'UNAUTHORIZED' },
        },
        { status: 401 }
      ) as any,
    })

    const response = await GET()
    const data = await response?.json()

    expect(response?.status).toBe(401)
    expect(data).toMatchObject({
      success: false,
      statusCode: 401,
      message: 'Authentication token not found',
      error: { code: 'UNAUTHORIZED' },
    })
  })

  it('should return 401 when token is invalid', async () => {
    vi.mocked(verifyAuth).mockResolvedValue({
      user: null,
      error: Response?.json(
        {
          success: false,
          statusCode: 401,
          message: 'Invalid or expired token',
          error: { code: 'INVALID_TOKEN' },
        },
        { status: 401 }
      ) as any,
    })

    const response = await GET()
    const data = await response?.json()

    expect(response?.status).toBe(401)
    expect(data).toMatchObject({
      success: false,
      statusCode: 401,
      message: 'Invalid or expired token',
      error: {
        code: 'INVALID_TOKEN',
      },
    })
  })

  it('should return 200 with user data when token is valid', async () => {
    vi.mocked(verifyAuth).mockResolvedValue({
      user: mockAuthUser,
    })
    mockGetUserProfileUseCase.execute.mockResolvedValue({ user: mockUser })

    const response = await GET()
    const data = await response?.json()

    expect(response?.status).toBe(200)
    expect(data).toMatchObject({
      success: true,
      statusCode: 200,
      message: 'User data retrieved successfully',
      data: {
        id: mockUser.id,
        nome: mockUser.nome,
        sobrenome: mockUser.sobrenome,
        username: mockUser.username,
        nomeCompleto: 'John Doe',
        email: mockUser.email,
        foto: mockUser.foto,
        telefone: mockUser.telefone,
        admin: mockUser.admin,
        superadmin: mockUser.superadmin,
        idempresa: mockUser.idempresa,
        empresa: mockUser.empresa,
        departamento: mockUser.departamento,
        time: mockUser.time,
        online: mockUser.online,
      },
    })
  })

  it('should build correct full name from nome and sobrenome', async () => {
    vi.mocked(verifyAuth).mockResolvedValue({
      user: mockAuthUser,
    })
    mockGetUserProfileUseCase.execute.mockResolvedValue({ user: mockUser })

    const response = await GET()
    const data = await response?.json()

    expect(data.data.nomeCompleto).toBe('John Doe')
  })

  it('should handle user with empty sobrenome', async () => {
    const userWithoutLastName: User = {
      ...mockUser,
      sobrenome: '',
    }

    vi.mocked(verifyAuth).mockResolvedValue({
      user: mockAuthUser,
    })
    mockGetUserProfileUseCase.execute.mockResolvedValue({ user: userWithoutLastName })

    const response = await GET()
    const data = await response?.json()

    expect(data.data.nomeCompleto).toBe('John')
  })

  it('should return all expected user fields', async () => {
    vi.mocked(verifyAuth).mockResolvedValue({
      user: mockAuthUser,
    })
    mockGetUserProfileUseCase.execute.mockResolvedValue({ user: mockUser })

    const response = await GET()
    const data = await response?.json()

    expect(data.data).toHaveProperty('id')
    expect(data.data).toHaveProperty('nome')
    expect(data.data).toHaveProperty('sobrenome')
    expect(data.data).toHaveProperty('username')
    expect(data.data).toHaveProperty('nomeCompleto')
    expect(data.data).toHaveProperty('email')
    expect(data.data).toHaveProperty('foto')
    expect(data.data).toHaveProperty('telefone')
    expect(data.data).toHaveProperty('admin')
    expect(data.data).toHaveProperty('superadmin')
    expect(data.data).toHaveProperty('idempresa')
    expect(data.data).toHaveProperty('empresa')
    expect(data.data).toHaveProperty('departamento')
    expect(data.data).toHaveProperty('time')
    expect(data.data).toHaveProperty('online')
  })

  it('should not expose sensitive data', async () => {
    vi.mocked(verifyAuth).mockResolvedValue({
      user: mockAuthUser,
    })
    mockGetUserProfileUseCase.execute.mockResolvedValue({ user: mockUser })

    const response = await GET()
    const data = await response?.json()

    expect(data.data).not.toHaveProperty('senha')
    expect(data.data).not.toHaveProperty('session_token')
    expect(data.data).not.toHaveProperty('senha_api_md5')
  })
})
