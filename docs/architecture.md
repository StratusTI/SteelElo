# Arquitetura do Projeto Nexo

## Visao Geral

Nexo e uma aplicacao web construida com Next.js 14+ usando App Router, com foco em gerenciamento de projetos empresariais.

## Stack Tecnologico

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI:** React 18+ com Server Components
- **Estilizacao:** Tailwind CSS
- **Componentes:** shadcn/ui
- **Estado:** TanStack Query (React Query)
- **Formularios:** React Hook Form + Zod

### Backend
- **API Routes:** Next.js Route Handlers
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL (dois schemas: Steel e Elo)
- **Autenticacao:** JWT com refresh tokens

## Estrutura de Diretorios

```
nexo/
├── app/                          # Next.js App Router
│   ├── (protected)/              # Rotas autenticadas
│   │   └── [enterpriseId]/       # Rotas por empresa
│   │       ├── projects/         # Modulo de projetos
│   │       ├── wiki/             # Modulo de documentacao
│   │       ├── ai/               # Modulo de IA
│   │       └── settings/         # Configuracoes
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticacao
│   │   ├── projects/             # CRUD de projetos
│   │   └── company/              # Dados da empresa
│   ├── components/               # Componentes globais
│   └── providers/                # Context providers
├── components/                   # Componentes UI (shadcn)
│   ├── ui/                       # Primitivos UI
│   └── hooks/                    # Hooks de componentes
├── src/                          # Logica de negocio
│   ├── @types/                   # Tipos TypeScript
│   ├── http/                     # Middlewares HTTP
│   ├── lib/                      # Bibliotecas (Prisma, etc)
│   ├── repositories/             # Camada de dados
│   ├── use-cases/                # Casos de uso
│   └── utils/                    # Utilitarios
└── prisma/                       # Schemas Prisma
    ├── steel/                    # Schema de usuarios/empresas
    └── elo/                      # Schema de projetos
```

## Camadas da Aplicacao

### 1. Camada de Apresentacao (app/)

#### Server Components
Componentes padrao do Next.js que renderizam no servidor:
- Paginas principais (`page.tsx`)
- Layouts (`layout.tsx`)
- Loading states (`loading.tsx`)

#### Client Components
Marcados com `'use client'`, usados para:
- Interatividade (forms, modais)
- Hooks de estado
- Event handlers

### 2. Camada de API (app/api/)

Route Handlers que seguem o padrao REST:
- `GET` - Leitura de dados
- `POST` - Criacao
- `PATCH` - Atualizacao parcial
- `DELETE` - Remocao

Todas as rotas protegidas usam `verifyJWT()` para autenticacao.

### 3. Camada de Casos de Uso (src/use-cases/)

Implementa a logica de negocio isolada:
- Validacoes de permissao
- Regras de negocio
- Orquestracao de repositorios

Padrao de implementacao:
```typescript
export class AddProjectMemberUseCase {
  constructor(
    private projectMembersRepository: ProjectMembersRepository,
    private projectRepository: ProjectRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute(request: Request): Promise<Response> {
    // Validacoes e logica de negocio
  }
}
```

### 4. Camada de Repositorios (src/repositories/)

Abstrai o acesso ao banco de dados:
- Interfaces definem contratos
- Implementacoes Prisma para producao
- Facilita testes com mocks

```typescript
// Interface
export interface ProjectRepository {
  findById(id: number): Promise<Project | null>
  create(data: CreateProjectData): Promise<Project>
}

// Implementacao
export class PrismaProjectRepository implements ProjectRepository {
  // ...
}
```

## Fluxo de Dados

```
[Browser]
    ↓ Request
[Middleware] → verifyJWT()
    ↓
[API Route] → Validacao de entrada
    ↓
[Use Case] → Logica de negocio
    ↓
[Repository] → Prisma
    ↓
[Database] → PostgreSQL
```

## Autenticacao

### Fluxo de Login
1. Usuario envia credenciais para `/api/auth/login`
2. Servidor valida e gera tokens JWT
3. `auth_token` (1h) e `refresh_token` (7d) sao setados como cookies HttpOnly

### Refresh Token
- Quando `auth_token` expira, `tryRefreshToken()` e chamado automaticamente
- Novos tokens sao gerados sem necessidade de re-login
- Cache em memoria evita queries repetidas ao banco

### Middleware de Verificacao
```typescript
export async function verifyJWT(): Promise<VerifyJWTResult> {
  // 1. Verifica auth_token
  // 2. Se invalido, tenta refresh
  // 3. Retorna user ou error
}
```

## Banco de Dados

### Schema Steel (Usuarios)
- `usuario` - Dados de usuarios
- `empresa` - Empresas/organizacoes

### Schema Elo (Projetos)
- `projeto` - Projetos
- `tarefa` - Tarefas
- `sprint` - Sprints
- `coluna` - Colunas do Kanban
- `documento` - Wiki/documentos
- `atividade` - Feed de atividades

## Providers

### QueryProvider
Configura TanStack Query para cache e sync de dados cliente.

### ThemeProvider
Gerencia tema (dark/light) com persistencia em localStorage.

## Padroes de Codigo

### Nomenclatura
- **Arquivos:** kebab-case (`project-members-client.tsx`)
- **Componentes:** PascalCase (`ProjectMembersClient`)
- **Funcoes:** camelCase (`fetchProjects`)
- **Constantes:** SCREAMING_SNAKE_CASE (`CACHE_TTL`)

### Imports
Usar path aliases configurados:
- `@/` - Raiz do projeto
- `@/src/` - Camada de logica
- `@/components/` - Componentes UI
