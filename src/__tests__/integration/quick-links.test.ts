import { GET, POST } from '@/app/api/quick-links/route';
import { DELETE, PATCH } from '@/app/api/quick-links/[id]/route';
import { AuthUser, verifyAuth } from '@/src/auth';
import { makeCreateQuickLinkUseCase } from '@/src/use-cases/factories/make-create-quick-link';
import { makeDeleteQuickLinkUseCase } from '@/src/use-cases/factories/make-delete-quick-link';
import { makeGetQuickLinksUseCase } from '@/src/use-cases/factories/make-get-quick-links';
import { makeUpdateQuickLinkUseCase } from '@/src/use-cases/factories/make-update-quick-link';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/auth', () => ({
  verifyAuth: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-create-quick-link', () => ({
  makeCreateQuickLinkUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-get-quick-links', () => ({
  makeGetQuickLinksUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-update-quick-link', () => ({
  makeUpdateQuickLinkUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-delete-quick-link', () => ({
  makeDeleteQuickLinkUseCase: vi.fn(),
}));

describe('Quick Links API', () => {
  const mockAuthUser: AuthUser = {
    id: 1,
    email: 'john.doe@example.com',
    admin: false,
    superadmin: false,
    enterpriseId: 1,
  };

  const mockQuickLink = {
    id: 1,
    usuarioId: 1,
    url: 'https://example.com',
    titulo: 'Example',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/quick-links', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: null,
        error: Response.json(
          {
            success: false,
            statusCode: 401,
            message: 'Authentication token not found',
            error: { code: 'UNAUTHORIZED' },
          },
          { status: 401 }
        ) as any,
      });

      const response = await GET();
      const data = await response?.json();

      expect(response?.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return quick links when authenticated', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          quickLinks: [mockQuickLink],
        }),
      };
      vi.mocked(makeGetQuickLinksUseCase).mockReturnValue(mockUseCase as any);

      const response = await GET();
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.quickLinks).toHaveLength(1);
      expect(data.data.quickLinks[0].url).toBe('https://example.com');
    });
  });

  describe('POST /api/quick-links', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: null,
        error: Response.json(
          {
            success: false,
            statusCode: 401,
            error: { code: 'UNAUTHORIZED' },
          },
          { status: 401 }
        ) as any,
      });

      const request = new NextRequest('http://localhost/api/quick-links', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' }),
      });

      const response = await POST(request);
      expect(response?.status).toBe(401);
    });

    it('should create quick link with valid data', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          quickLink: mockQuickLink,
        }),
      };
      vi.mocked(makeCreateQuickLinkUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/quick-links', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com', titulo: 'Example' }),
      });

      const response = await POST(request);
      const data = await response?.json();

      expect(response?.status).toBe(201);
      expect(data.message).toBe('Quick link created successfully');
      expect(data.data.quickLink.url).toBe('https://example.com');
    });

    it('should return validation error for invalid data', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const request = new NextRequest('http://localhost/api/quick-links', {
        method: 'POST',
        body: JSON.stringify({ url: '' }),
      });

      const response = await POST(request);
      const data = await response?.json();

      expect(response?.status).toBe(422);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/quick-links/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: null,
        error: Response.json(
          {
            success: false,
            statusCode: 401,
            error: { code: 'UNAUTHORIZED' },
          },
          { status: 401 }
        ) as any,
      });

      const request = new NextRequest('http://localhost/api/quick-links/1', {
        method: 'PATCH',
        body: JSON.stringify({ titulo: 'New Title' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
      expect(response?.status).toBe(401);
    });

    it('should return 400 for invalid ID', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const request = new NextRequest('http://localhost/api/quick-links/abc', {
        method: 'PATCH',
        body: JSON.stringify({ titulo: 'New Title' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'abc' }) });
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should update quick link with valid data', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const updatedQuickLink = { ...mockQuickLink, titulo: 'New Title' };
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          quickLink: updatedQuickLink,
        }),
      };
      vi.mocked(makeUpdateQuickLinkUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/quick-links/1', {
        method: 'PATCH',
        body: JSON.stringify({ titulo: 'New Title' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.message).toBe('Quick link updated successfully');
      expect(data.data.quickLink.titulo).toBe('New Title');
    });
  });

  describe('DELETE /api/quick-links/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: null,
        error: Response.json(
          {
            success: false,
            statusCode: 401,
            error: { code: 'UNAUTHORIZED' },
          },
          { status: 401 }
        ) as any,
      });

      const request = new NextRequest('http://localhost/api/quick-links/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
      expect(response?.status).toBe(401);
    });

    it('should return 400 for invalid ID', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const request = new NextRequest('http://localhost/api/quick-links/abc', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'abc' }) });
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should delete quick link successfully', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(makeDeleteQuickLinkUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/quick-links/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.message).toBe('Quick link deleted successfully');
      expect(data.data.success).toBe(true);
    });
  });
});
