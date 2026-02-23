# Padrões de Código

## Padrões ativos neste projeto

Os padrões abaixo foram escolhidos com justificativa concreta.
Não adicione novos padrões sem problema identificado que os justifique

---

## 1. Repository Pattern

**Problema que resolve:** isola o Prisma do restante do sistema. Services e workers não dependem de detalhes de query.

**Regras:**
- Um repository por entidade principal do domínio
- Métodos nomeados pela intenção, não pela query (`findByWorkspace`, não `selectWhereWorkspaceId`)
- Retorna `Result<T, AppError>` — nunca lança exceção
- Try/catch obrigatório ao redor de toda chamada Prisma
- Erros do Prisma são convertidos via factory functions (`notFound()`, `databaseError()`, `conflict()`)

---

## 2. DTO (Data Transfer Object)

**Problema que resolve:** evita que objetos Prisma com campos sensíveis vazem para o cliente. Define contratos explícitos entre camadas.

**Regras:**
- DTOs de entrada são inferidos dos schemas Zod (`z.infer<typeof Schema>`)
- DTOs de saída são definidos manualmente em `/types/`
- Objetos Prisma nunca são retornados diretamente pelas API Routes
- A conversão entre Prisma type e DTO de saída é responsabilidade do Mapper

--

## 3. Mapper

**Problema que resolve:** centraliza a conversão entre Prisma types e DTOs. Evita conversão espalhada em services e routes.

**Regras:**
- Um mapper por entidade
- Funções puras, sem efeitos colaterais
- Fica em `/src/mappers/`

---

## 4. Unit of Work (transações multi-repositório)

**Problema que resolve:** quando uma operação precisa escrever em múltiplas tabelas atomicamente, o Service não deve gerenciar `prisma.$transaction` diretamente.

**Regras:**
- Usado apenas quando há escrita em 2+ repositories na mesma operação
- O Service passa um callback, não conhece detalhes da transação

---

## 5. Strategy (implementações intercambiáveis)

**Problema que resolve:** quando o comportamento varia por contexto mas a interface é a mesma.

**Usado em:** NotificationService (email vs in-app), StorageService (local vs Postgres).

**Regras:**
- Define uma interface explícita
- Implementações ficam em subpastas do serviço
- A escolha da implementação é feita na inicialização, não espalhada pelo código

---

## Object Calisthenics — Princípios Selecionados

Aplicar apenas os três abaixo. Os demais geram cerimônia sem benefício no TypeScript.

### Early Return (sem else)

### Encapsule primitivos com significado

### Responsabilidade única

Cada função faz uma coisa. Se você precisar de "e" para descrever o que ela faz, ela precisa ser dividida.

---

## Convenções de Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Schema Zod | `PascalCaseSchema` | `CreateProjectSchema` |
| DTO de entrada | inferido do schema | `CreateProjectDTO` |
| DTO de saída | `PascalCaseDTO` | `ProjectDTO` |
| Service | `PascalCaseService` | `ProjectService` |
| Repository | `PascalCaseRepository` | `ProjectRepository` |
| Mapper | `toCamelCaseDTO` | `toProjectDTO` |
| Erro de domínio (factory) | `camelCase` | `conflict()`, `notFound()` |
