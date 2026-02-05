# Guia de Desenvolvimento - Nexo

## Configuracao do Ambiente

### Pre-requisitos
- Node.js 18+
- pnpm
- PostgreSQL
- Docker (opcional)

### Instalacao

```bash
# Clonar repositorio
git clone <repo-url>
cd nexo

# Instalar dependencias
pnpm install

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Gerar cliente Prisma
pnpm prisma generate --schema=prisma/steel/schema.prisma
pnpm prisma generate --schema=prisma/elo/schema.prisma

# Executar migrations
pnpm prisma migrate dev --schema=prisma/steel/schema.prisma
pnpm prisma migrate dev --schema=prisma/elo/schema.prisma

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Variaveis de Ambiente

```env
# Banco de dados
DATABASE_URL_STEEL="postgresql://user:pass@localhost:5432/nexo_steel"
DATABASE_URL_ELO="postgresql://user:pass@localhost:5432/nexo_elo"

# JWT
JWT_SECRET="sua-chave-secreta"
JWT_REFRESH_SECRET="sua-chave-refresh"

# Aplicacao
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Estrutura de Desenvolvimento

### Criando uma Nova Pagina

1. Crie o arquivo em `app/(protected)/[enterpriseId]/sua-pagina/page.tsx`
2. Por padrao, use Server Component
3. Extraia partes interativas para Client Components

```typescript
// page.tsx (Server Component)
import { verifyJWT } from '@/src/http/middlewares/verify-jwt';

export default async function SuaPagina() {
  const { user, error } = await verifyJWT();
  if (error) redirect('/login');

  const data = await fetchData();

  return (
    <div>
      <h1>Sua Pagina</h1>
      <InteractiveComponent data={data} />
    </div>
  );
}
```

```typescript
// _components/interactive-component.tsx
'use client';

export function InteractiveComponent({ data }) {
  const [state, setState] = useState();
  // ...
}
```

### Criando uma API Route

1. Crie em `app/api/seu-recurso/route.ts`
2. Use `verifyJWT()` para autenticacao
3. Use Use Cases para logica de negocio

```typescript
import { verifyJWT } from '@/src/http/middlewares/verify-jwt';
import { successResponse, handleApiError } from '@/src/utils/http-response';
import { makeGetResourceUseCase } from '@/src/use-cases/factories/make-get-resource';

export async function GET() {
  try {
    const { user, error } = await verifyJWT();
    if (error || !user) return error;

    const useCase = makeGetResourceUseCase();
    const result = await useCase.execute({ user });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Criando um Use Case

1. Crie em `src/use-cases/seu-use-case.ts`
2. Injete repositories via construtor
3. Crie factory em `src/use-cases/factories/`

```typescript
// src/use-cases/create-resource.ts
interface CreateResourceRequest {
  user: User;
  data: ResourceData;
}

interface CreateResourceResponse {
  resource: Resource;
}

export class CreateResourceUseCase {
  constructor(
    private resourceRepository: ResourceRepository
  ) {}

  async execute({ user, data }: CreateResourceRequest): Promise<CreateResourceResponse> {
    // Validacoes
    if (!user.admin) {
      throw new InsufficientPermissionsError();
    }

    // Logica de negocio
    const resource = await this.resourceRepository.create({
      ...data,
      createdBy: user.id
    });

    return { resource };
  }
}
```

```typescript
// src/use-cases/factories/make-create-resource.ts
import { PrismaResourceRepository } from '@/src/repositories/prisma/prisma-resource-repository';
import { CreateResourceUseCase } from '../create-resource';

export function makeCreateResourceUseCase() {
  const resourceRepository = new PrismaResourceRepository();
  return new CreateResourceUseCase(resourceRepository);
}
```

### Criando um Repository

1. Defina interface em `src/repositories/resource-repository.ts`
2. Implemente em `src/repositories/prisma/prisma-resource-repository.ts`

```typescript
// src/repositories/resource-repository.ts
export interface ResourceRepository {
  findById(id: number): Promise<Resource | null>;
  findByCompany(companyId: number): Promise<Resource[]>;
  create(data: CreateResourceData): Promise<Resource>;
  update(id: number, data: UpdateResourceData): Promise<Resource>;
  delete(id: number): Promise<void>;
}
```

```typescript
// src/repositories/prisma/prisma-resource-repository.ts
import { prismaElo } from '@/src/lib/prisma';
import { ResourceRepository } from '../resource-repository';

export class PrismaResourceRepository implements ResourceRepository {
  async findById(id: number) {
    return prismaElo.resource.findUnique({
      where: { id }
    });
  }

  // ... outros metodos
}
```

## Padroes de Codigo

### Componentes React

```typescript
// Componente Server (padrao)
export default async function Component() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Componente Client
'use client';

interface Props {
  initialData: Data;
}

export function InteractiveComponent({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  return <button onClick={() => setData(newData)}>Update</button>;
}
```

### Hooks Personalizados

```typescript
// src/hooks/use-resource.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useResource(id: number) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => fetchResource(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
```

### Tratamento de Erros

```typescript
// Em Use Cases
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';

if (!resource) throw new ResourceNotFoundError();
if (!hasPermission) throw new InsufficientPermissionsError();
```

```typescript
// Em API Routes
import { handleApiError } from '@/src/utils/http-response';

export async function GET() {
  try {
    // ...
  } catch (error) {
    return handleApiError(error); // Mapeia erros para HTTP responses
  }
}
```

## Testes

### Estrutura de Testes

```
tests/
├── unit/
│   └── use-cases/
│       └── create-resource.spec.ts
├── integration/
│   └── api/
│       └── resources.spec.ts
└── e2e/
    └── resources.spec.ts
```

### Exemplo de Teste Unitario

```typescript
import { CreateResourceUseCase } from '@/src/use-cases/create-resource';
import { InMemoryResourceRepository } from '@/tests/repositories/in-memory-resource-repository';

describe('CreateResourceUseCase', () => {
  let useCase: CreateResourceUseCase;
  let repository: InMemoryResourceRepository;

  beforeEach(() => {
    repository = new InMemoryResourceRepository();
    useCase = new CreateResourceUseCase(repository);
  });

  it('should create a resource', async () => {
    const result = await useCase.execute({
      user: mockUser,
      data: { name: 'Test' }
    });

    expect(result.resource).toBeDefined();
    expect(result.resource.name).toBe('Test');
  });
});
```

## Comandos Uteis

```bash
# Desenvolvimento
pnpm dev              # Iniciar servidor dev
pnpm build            # Build de producao
pnpm start            # Iniciar build de producao

# Prisma
pnpm prisma studio    # Interface visual do banco
pnpm prisma generate  # Gerar cliente
pnpm prisma migrate dev # Criar migration
pnpm prisma db push   # Push schema sem migration

# Linting
pnpm lint             # Executar ESLint
pnpm lint:fix         # Corrigir problemas automaticamente

# Testes
pnpm test             # Executar testes
pnpm test:watch       # Modo watch
pnpm test:coverage    # Com coverage
```

## Git Workflow

### Branches
- `main` - Producao
- `develop` - Desenvolvimento
- `feature/nome-feature` - Nova funcionalidade
- `fix/nome-fix` - Correcao de bug

### Commits
Use Conventional Commits:
```
feat: adiciona nova funcionalidade
fix: corrige bug no login
refactor: melhora performance da busca
docs: atualiza README
chore: atualiza dependencias
```

### Pull Requests
1. Crie branch a partir de `develop`
2. Faca commits pequenos e focados
3. Abra PR para `develop`
4. Aguarde code review
5. Merge apos aprovacao

## Debugging

### Logs de Desenvolvimento
```typescript
console.log('Debug:', data);
```

### Prisma Query Logs
```typescript
// prisma/lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### React DevTools
Instale a extensao do navegador para inspecionar componentes e estado.

### Network Tab
Use DevTools > Network para verificar requests e responses da API.
