import type { DocumentWithCreator } from '@/src/hooks/use-documents';

export function sortDocuments(
  docs: DocumentWithCreator[],
  field: string,
  order: string,
): DocumentWithCreator[] {
  const sorted = [...docs].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'name':
        comparison = a.titulo.localeCompare(b.titulo);
        break;
      case 'date-created':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'date-updated':
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      default:
        comparison = 0;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}
