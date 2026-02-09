import { GET, POST } from '@/app/api/stickies/route';
import { DELETE, PATCH } from '@/app/api/stickies/[id]/route';
import { AuthUser, verifyAuth } from '@/src/auth';
import { makeCreateStickyUseCase } from '@/src/use-cases/factories/make-create-sticky';
import { makeDeleteStickyUseCase } from '@/src/use-cases/factories/make-delete-sticky';
import { makeGetStickiesUseCase } from '@/src/use-cases/factories/make-get-stickies';
import { makeUpdateStickyUseCase } from '@/src/use-cases/factories/make-update-sticky';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/auth', () => ({
  verifyAuth: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-create-sticky', () => ({
  makeCreateStickyUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-get-stickies', () => ({
  makeGetStickiesUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-update-sticky', () => ({
  makeUpdateStickyUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-delete-sticky', () => ({
  makeDeleteStickyUseCase: vi.fn(),
}));

describe('Stickies API', () => {
  const mockAuthUser: AuthUser = {
    id: 1,
    email: 'john.doe@example.com',
    admin: false,
    superadmin: false,
    enterpriseId: 1,
  };

  const mockSticky = {
    id: 1,
    usuarioId: 1,
    content: 'Test sticky content',
    backgroundColor: 'gray',
    isBold: false,
    isItalic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/stickies', () => {
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

      const request = new NextRequest('http://localhost/api/stickies');
      const response = await GET(request);
      const data = await response?.json();

      expect(response?.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return stickies when authenticated', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          stickies: [mockSticky],
        }),
      };
      vi.mocked(makeGetStickiesUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/stickies');
      const response = await GET(request);
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.stickies).toHaveLength(1);
      expect(data.data.stickies[0].content).toBe('Test sticky content');
    });

    it('should pass search filter to use case', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          stickies: [mockSticky],
        }),
      };
      vi.mocked(makeGetStickiesUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest(
        'http://localhost/api/stickies?search=test'
      );
      const response = await GET(request);

      expect(response?.status).toBe(200);
      expect(mockUseCase.execute).toHaveBeenCalledWith({
        user: mockAuthUser,
        filters: { search: 'test' },
      });
    });

    it('should return empty array when no stickies exist', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          stickies: [],
        }),
      };
      vi.mocked(makeGetStickiesUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/stickies');
      const response = await GET(request);
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.stickies).toHaveLength(0);
    });
  });

  describe('POST /api/stickies', () => {
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

      const request = new NextRequest('http://localhost/api/stickies', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test content' }),
      });

      const response = await POST(request);
      expect(response?.status).toBe(401);
    });

    it('should create sticky with valid data', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          sticky: mockSticky,
        }),
      };
      vi.mocked(makeCreateStickyUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/stickies', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test sticky content' }),
      });

      const response = await POST(request);
      const data = await response?.json();

      expect(response?.status).toBe(201);
      expect(data.message).toBe('Sticky created successfully');
      expect(data.data.sticky.content).toBe('Test sticky content');
    });

    it('should create sticky with all options', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const styledSticky = {
        ...mockSticky,
        backgroundColor: 'purple',
        isBold: true,
        isItalic: true,
      };

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          sticky: styledSticky,
        }),
      };
      vi.mocked(makeCreateStickyUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/stickies', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Styled sticky',
          backgroundColor: 'purple',
          isBold: true,
          isItalic: true,
        }),
      });

      const response = await POST(request);
      const data = await response?.json();

      expect(response?.status).toBe(201);
      expect(data.data.sticky.backgroundColor).toBe('purple');
      expect(data.data.sticky.isBold).toBe(true);
      expect(data.data.sticky.isItalic).toBe(true);
    });

    it('should allow empty content for new stickies', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const emptySticky = {
        ...mockSticky,
        content: '',
      };

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          sticky: emptySticky,
        }),
      };
      vi.mocked(makeCreateStickyUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/stickies', {
        method: 'POST',
        body: JSON.stringify({ content: '' }),
      });

      const response = await POST(request);
      const data = await response?.json();

      expect(response?.status).toBe(201);
      expect(data.data.sticky.content).toBe('');
    });

    it('should return validation error for invalid color', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const request = new NextRequest('http://localhost/api/stickies', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Test',
          backgroundColor: 'invalid-color',
        }),
      });

      const response = await POST(request);
      const data = await response?.json();

      expect(response?.status).toBe(422);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/stickies/[id]', () => {
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

      const request = new NextRequest('http://localhost/api/stickies/1', {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Updated content' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });
      expect(response?.status).toBe(401);
    });

    it('should return 400 for invalid ID', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const request = new NextRequest('http://localhost/api/stickies/abc', {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Updated content' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'abc' }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should update sticky content', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const updatedSticky = { ...mockSticky, content: 'Updated content' };
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          sticky: updatedSticky,
        }),
      };
      vi.mocked(makeUpdateStickyUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/stickies/1', {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Updated content' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.message).toBe('Sticky updated successfully');
      expect(data.data.sticky.content).toBe('Updated content');
    });

    it('should update sticky background color', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const updatedSticky = { ...mockSticky, backgroundColor: 'peach' };
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          sticky: updatedSticky,
        }),
      };
      vi.mocked(makeUpdateStickyUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/stickies/1', {
        method: 'PATCH',
        body: JSON.stringify({ backgroundColor: 'peach' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.sticky.backgroundColor).toBe('peach');
    });

    it('should update sticky formatting options', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const updatedSticky = { ...mockSticky, isBold: true, isItalic: true };
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          sticky: updatedSticky,
        }),
      };
      vi.mocked(makeUpdateStickyUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/stickies/1', {
        method: 'PATCH',
        body: JSON.stringify({ isBold: true, isItalic: true }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.sticky.isBold).toBe(true);
      expect(data.data.sticky.isItalic).toBe(true);
    });

    it('should return validation error for invalid color on update', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const request = new NextRequest('http://localhost/api/stickies/1', {
        method: 'PATCH',
        body: JSON.stringify({ backgroundColor: 'invalid-color' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(422);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/stickies/[id]', () => {
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

      const request = new NextRequest('http://localhost/api/stickies/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      });
      expect(response?.status).toBe(401);
    });

    it('should return 400 for invalid ID', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const request = new NextRequest('http://localhost/api/stickies/abc', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'abc' }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should delete sticky successfully', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: mockAuthUser,
      });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(makeDeleteStickyUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/stickies/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: '1' }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.message).toBe('Sticky deleted successfully');
      expect(data.data.success).toBe(true);
    });
  });
});
