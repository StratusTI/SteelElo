import type { Document } from '@/src/@types/document';
import { prismaSteel } from '@/src/lib/prisma';

interface DocumentCreator {
  id: number;
  username: string;
  foto: string;
}

interface DocumentWithCreator extends Document {
  creator?: DocumentCreator;
}

export async function enrichDocumentWithCreator(
  doc: Document,
): Promise<DocumentWithCreator> {
  const user = await prismaSteel.usuario.findUnique({
    where: { id: doc.createdBy },
    select: { id: true, username: true, foto: true },
  });

  return {
    ...doc,
    creator: user
      ? {
          id: user.id,
          username: user.username ?? '',
          foto: user.foto ?? '',
        }
      : undefined,
  };
}

export async function enrichDocumentsWithCreator(
  docs: Document[],
): Promise<DocumentWithCreator[]> {
  const userIds = [...new Set(docs.map((d) => d.createdBy))];

  if (userIds.length === 0) return docs;

  const users = await prismaSteel.usuario.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, foto: true },
  });

  const userMap = new Map(
    users.map((u) => [
      u.id,
      { id: u.id, username: u.username ?? '', foto: u.foto ?? '' },
    ]),
  );

  return docs.map((doc) => ({
    ...doc,
    creator: userMap.get(doc.createdBy),
  }));
}
