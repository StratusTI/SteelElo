# Guia de Performance - Nexo

Este documento descreve as melhores praticas de performance adotadas no projeto e problemas conhecidos a evitar.

## Server Components vs Client Components

### Regra Geral
**Prefira Server Components** sempre que possivel. Use Client Components apenas quando necessario.

### Quando usar Server Components
- Fetch de dados inicial
- Acesso a banco de dados
- Componentes sem interatividade
- SEO e metadata

### Quando usar Client Components
- Event handlers (onClick, onChange)
- Hooks de estado (useState, useEffect)
- APIs do browser (localStorage, window)
- Bibliotecas client-only

### Padrao Recomendado
Separe paginas em Server + Client components:

```typescript
// page.tsx (Server Component)
export default async function ProjectsPage({ searchParams }) {
  const data = await fetchData();
  return (
    <div>
      <ProjectsFilters />        {/* Client - interatividade */}
      <ProjectsGrid data={data} /> {/* Server - dados estaticos */}
    </div>
  );
}
```

## Caching

### API Routes com unstable_cache

```typescript
import { unstable_cache } from 'next/cache';

export async function GET() {
  const getCachedData = unstable_cache(
    async () => fetchExpensiveData(),
    ['cache-key'],
    { revalidate: 60, tags: ['data-tag'] }
  );

  return successResponse(await getCachedData());
}
```

### Invalidacao de Cache

```typescript
import { revalidateTag } from 'next/cache';

export async function POST() {
  // Apos criar/atualizar dados
  revalidateTag('data-tag');
}
```

### Cache-Control Headers

Adicione headers para cache do browser:
```typescript
return successResponse(data, 200, undefined, {
  maxAge: 60,
  staleWhileRevalidate: 120
});
```

## TanStack Query

### Estrutura de Query Keys

```typescript
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: object) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
};
```

### Configuracao Recomendada

```typescript
useQuery({
  queryKey: projectKeys.list(filters),
  queryFn: () => fetchProjects(filters),
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 10 * 60 * 1000,   // 10 minutos
});
```

### Evite router.refresh()

**Errado:**
```typescript
const handleSubmit = async () => {
  await createProject(data);
  router.refresh(); // Recarrega TODA a pagina
};
```

**Correto:**
```typescript
const queryClient = useQueryClient();

const handleSubmit = async () => {
  await createProject(data);
  queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
};
```

## Debounce em Buscas

Sempre use debounce em campos de busca:

```typescript
import { useDebounce } from '@/src/hooks/use-debounce';

function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchResults(debouncedSearch);
  }, [debouncedSearch]);
}
```

## Otimizacoes Prisma

### Indices

Sempre adicione indices para:
- Campos usados em WHERE frequentemente
- Campos usados em ORDER BY
- Foreign keys
- Campos compostos em queries combinadas

```prisma
model Projeto {
  @@index([idempresa, ownerId])
  @@index([status, createdAt])
}
```

### Evite N+1 Queries

**Errado:**
```typescript
const projects = await prisma.projeto.findMany();
for (const project of projects) {
  const members = await prisma.projetoMembro.findMany({
    where: { projetoId: project.id }
  });
}
```

**Correto:**
```typescript
const projects = await prisma.projeto.findMany({
  include: {
    membros: true
  }
});
```

### Queries Paralelas

```typescript
const [project, members, tasks] = await Promise.all([
  projectRepository.findById(id),
  membersRepository.findByProject(id),
  tasksRepository.findByProject(id),
]);
```

### Select Apenas Campos Necessarios

```typescript
const users = await prisma.usuario.findMany({
  select: {
    id: true,
    nome: true,
    email: true,
    // NAO inclua campos grandes desnecessarios
  }
});
```

## Loading States

### Use Suspense + Loading.tsx

```typescript
// loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

### Streaming com Suspense

```typescript
export default function Page() {
  return (
    <div>
      <Header /> {/* Renderiza imediatamente */}
      <Suspense fallback={<Skeleton />}>
        <SlowComponent /> {/* Streamed quando pronto */}
      </Suspense>
    </div>
  );
}
```

## Theme e Hydration

### Evite Flash de Tema

Use script inline no layout para aplicar tema antes do React:

```typescript
// layout.tsx
const themeScript = `
  (function(){
    try {
      var t = localStorage.getItem('nexo-user-preferences');
      if (t) {
        var p = JSON.parse(t);
        if (p.theme === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }
    } catch(e) {}
  })();
`;

<head>
  <script dangerouslySetInnerHTML={{ __html: themeScript }} />
</head>
```

## JWT e Autenticacao

### Cache de Usuario

O middleware de JWT usa cache em memoria para evitar queries repetidas:

```typescript
const userCache = new Map<number, { user: User; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
```

### Refresh Token Automatico

Tokens sao renovados automaticamente quando expiram, sem necessidade de re-login.

## Checklist de Performance

Antes de fazer merge:

- [ ] Paginas usam Server Components quando possivel
- [ ] Client Components sao pequenos e focados
- [ ] Buscas tem debounce
- [ ] API routes tem cache apropriado
- [ ] Queries Prisma tem indices necessarios
- [ ] Nao ha N+1 queries
- [ ] Loading states usam Skeleton
- [ ] Nao usa router.refresh() desnecessariamente
