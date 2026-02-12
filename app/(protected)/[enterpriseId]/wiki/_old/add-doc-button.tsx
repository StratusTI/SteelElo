'use client';

import { Add01Icon } from '@hugeicons-pro/core-stroke-rounded';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Icon } from '@/app/components/HugeIcons';
import { Button } from '@/components/ui/button';
import { useMatchesPath } from '@/lib/matchesPath';
import { useCreateDocument } from '@/src/hooks/use-documents';

export function AddDocButton() {
  const createDocument = useCreateDocument();
  const router = useRouter();
  const { buildPath } = useMatchesPath();

  const handleCreate = async () => {
    try {
      const result = await createDocument.mutateAsync({ titulo: 'Sem título' });
      const newDoc = result.data.document;
      router.push(buildPath(`/wiki/${newDoc.id}`));
    } catch {
      toast.error('Falha ao criar documento');
    }
  };

  return (
    <Button
      size='sm'
      className='bg-branding hover:bg-branding/90 text-white'
      onClick={handleCreate}
      disabled={createDocument.isPending}
    >
      <Icon icon={Add01Icon} />
      {createDocument.isPending ? 'Criando...' : 'Criar documento'}
    </Button>
  );
}
