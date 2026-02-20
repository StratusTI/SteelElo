# Análise Arquitetural - SteelElo (Nexo)

## Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **ORM**: Prisma 6.18 (2 schemas: `elo` + `steel`)
- **Testes**: Vitest + Supertest
- **Validação**: Zod 4
- **Linting**: Biome 2.2
- **Editor**: TipTap (wiki)

## Arquitetura Atual

```
app/api/**/*.ts          → Route Handlers (controllers finos)
src/use-cases/*.ts       → Application Layer (40 use cases)
src/use-cases/errors/    → Domain Errors tipados
src/use-cases/factories/ → Factory functions (DI manual)
src/repositories/*.ts    → Repository Interfaces (contratos)
src/repositories/prisma/ → Prisma Implementations
src/repositories/in-memory/ → In-Memory Implementations (testes)
src/http/middlewares/     → Middlewares HTTP
src/auth/                → Auth module (JWT, cookies)
```

## Números

| Camada | Quantidade |
|---|---|
| Route Handlers | ~29 rotas |
| Use Cases | 40 |
| Repository Interfaces | 8 |
| Prisma Implementations | 8 |
| In-Memory Implementations | 7 |
| Factories | ~40 |
| Domain Errors | 8 arquivos |
| Testes Unitários | 34 |

## Padrões Identificados

### 1. Route Handlers Finos
Cada handler faz: auth → validação (Zod) → use case → mapeamento de erro HTTP.
Nenhuma regra de negócio nos handlers.

### 2. Use Cases com Regras de Negócio
Exemplo: `ArchiveDocumentUseCase` verifica ownership, status, e só então executa a mutation.

### 3. Repository Pattern com Inversão de Dependência
- Interfaces abstratas (`DocumentRepository`)
- Implementações Prisma para produção
- Implementações In-Memory para testes unitários

### 4. DI Manual via Factories
Sem container de IoC. Factory functions instanciam dependências concretas.

### 5. Domain Errors Tipados
Erros semânticos por domínio: `DocumentNotFoundError`, `DocumentNotOwnedError`, `ProjectNameAlreadyExistsError`.

### 6. RBAC por Projeto
`CheckUserPermissionUseCase` com role hierarchy e permissões granulares.

## Complexidade Real

- Document versioning
- Multi-tenant (2 schemas Prisma)
- OAuth integrations (Slack, Teams)
- Document tree com detecção de referência circular
- Cache layer com `unstable_cache` + `revalidateTag`

## Pontos de Atenção

- `enrichDocumentWithCreator` é chamado no route handler, não no use case (leak de lógica de apresentação)
- Alguns use cases são thin wrappers sobre o repository (normal em CRUD)
- Não há pasta `src/services/` - a camada se chama "Use Cases"
