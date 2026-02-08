export interface CreateQuickLinkRequest {
  url: string;
  titulo?: string;
}

export interface UpdateQuickLinkRequest {
  url?: string;
  titulo?: string;
}

export interface QuickLink {
  id: number;
  usuarioId: number;
  url: string;
  titulo: string | null;
  createdAt: Date;
  updatedAt: Date;
}
