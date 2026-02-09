export type StickyColor =
  | 'gray'
  | 'peach'
  | 'pink'
  | 'orange'
  | 'green'
  | 'lightblue'
  | 'darkblue'
  | 'purple';

export interface CreateStickyRequest {
  content?: string;
  backgroundColor?: StickyColor;
  isBold?: boolean;
  isItalic?: boolean;
}

export interface UpdateStickyRequest {
  content?: string;
  backgroundColor?: StickyColor;
  isBold?: boolean;
  isItalic?: boolean;
}

export interface StickyFilters {
  search?: string;
}

export interface Sticky {
  id: number;
  usuarioId: number;
  content: string;
  backgroundColor: StickyColor;
  isBold: boolean;
  isItalic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
