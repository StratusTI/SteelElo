export type DocumentStatus = 'draft' | 'published' | 'private' | 'archived';

export interface Document {
  id: string;
  titulo: string;
  icone: string;
  conteudo: string | null;
  parentId: string | null;
  ordem: number;
  empresaId: number | null;
  projetoId: string | null;
  status: DocumentStatus;
  createdBy: number;
  publicShareToken: string | null;
  isFullWidth: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentWithChildren extends Document {
  children: DocumentWithChildren[];
}

export interface DocumentVersion {
  id: string;
  documentoId: string;
  versao: number;
  conteudo: string;
  usuarioId: number;
  comentario: string | null;
  hashConteudo: string | null;
  createdAt: Date;
  alteracoesResumo: string | null;
  tamanhoBytes: number | null;
}

export interface CreateDocumentRequest {
  titulo: string;
  icone?: string;
  conteudo?: string;
  parentId?: string;
  empresaId?: number;
  projetoId?: string;
  status?: DocumentStatus;
}

export interface UpdateDocumentRequest {
  titulo?: string;
  icone?: string;
  conteudo?: string;
  status?: DocumentStatus;
  parentId?: string | null;
  ordem?: number;
  isFullWidth?: boolean;
  publicShareToken?: string | null;
}

export interface DocumentFilters {
  search?: string;
  status?: DocumentStatus;
  createdBy?: number;
  parentId?: string | null;
  empresaId?: number;
  projetoId?: string;
  favouriteUserId?: number;
}

export interface CreateVersionRequest {
  documentoId: string;
  conteudo: string;
  usuarioId: number;
  comentario?: string;
}
