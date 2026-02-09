import { POST } from '@/app/api/auth/logout/route'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDelete = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      delete: mockDelete,
      get: vi.fn(),
      set: vi.fn(),
    })
  ),
}))

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 200 on successful logout', async () => {
    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      success: true,
      statusCode: 200,
      message: 'User logged out successfully',
      data: {
        message: 'Logout successful',
      },
    })
  })

  it('should delete auth cookies', async () => {
    await POST()

    expect(mockDelete).toHaveBeenCalledWith('auth_token')
    expect(mockDelete).toHaveBeenCalledWith('refresh_token')
    expect(mockDelete).toHaveBeenCalledTimes(2)
  })

  it('should be idempotent (return success even if cookie does not exist)', async () => {
    mockDelete.mockImplementation(() => {
    })

    const response = await POST()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockDelete).toHaveBeenCalledWith('auth_token')
    expect(mockDelete).toHaveBeenCalledWith('refresh_token')
  })

  it('should return standardized response structure', async () => {
    const response = await POST()
    const data = await response.json()

    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('statusCode')
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('message')
    expect(data).not.toHaveProperty('error')
  })

  it('should include descriptive message in response', async () => {
    const response = await POST()
    const data = await response.json()

    expect(data.message).toBe('User logged out successfully')
    expect(data.data.message).toBe('Logout successful')
  })
})
