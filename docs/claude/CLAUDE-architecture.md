# Arquitetura: Service Layer

## Visão Geral

Este projeto utiliza arquitetura em camadas com separação explícita de responsabilidades.
O fluxo obrigatóro de toda operação é:

```
Client -> Server Action / API Route -> Zod -> Autorização -> Service -> Repository -> Prisma/PostgreSQL
```

## Camadas e Responsabilidades

### 1. Entrada — `app/api/**/route.ts` | `app/**/actions.ts`

- Recebe a requisição HTTP ou chamada de Server Action
- Extrai e deserializa o body
- Chama a validação Zod
- Chama o Service correspondente
- Traduz o `Result` em resposta HTTP (`handleError()` / `standardError()`) ou retorno de formulário
- **Não contém lógica de negócio**
- **Não importa Prisma diretamente**

### 2. Validação — `src/schemas/`

- Schema Zod por domínio
- Valida formato, tipos e campos obrigatórios
- **Não valida regras de negócio** (ex: "nome único" é regra de negócio, não validação de formato)
- Exporta o tipo inferido junto com o schema

### 3. Autorização — dentro do Service

- Verifica se o `actorId` tem permissão para executar a operação
- Fica no Service, não na Route - garante que workers támbém passem pela chegagem
- Retorna result com erro se não autorizado

### 4. Service — `src/services/`

- Contém toda a lógica de negócio
- Orquestra chamadas ao Repositoru, cache Redis e workers
- **Não importa Prisma diretamente**
- **Não sabe nada de HTTP** (sem `req`, `res`, status code)
- **Não acessa `process.env` para configuração de infra** - recebe dependências injetadas

### 5. Repository — `src/repositories/`

- Única camada que importa e usa Prisma
- Executa queries, nada mais
- Captura erros do Prisma e os converte em `Result` via factory functions (`notFound()`, `databaseError()`, `conflict()`)
- **Não contém lógica de negócio**
- **Não valida regras de negócio**

### 6. Cache — `src/cache/` (Cache-Aside)

**Leitura**
- Service verifica Redis
- Hit -> retorna do cache
- Miss -> repository busca no banco -> popula cache -> retorna

**Escrita**
- Service chama Repository -> banco
- Após sucesso -> invalida ou atualiza cache

## Estrutura de Pastas

```
/app
  /api/**/route.ts
  /**/actions.ts
/src
  /services/
  /repositories/
  /schemas/
  /cache/
  /errors/
/types/
/utils/
```

## Regras Invioláveis

| Regra | Motivo |
|---|---|
| Route não importa Prisma | Mantém a camada de dados isolada |
| Service não importa Prisma | Testabilidade e isolamento |
| Worker usa Service, não Prisma | Mesma lógica de negócio para todos os pontos de entrada |
| Try/catch só no Repository | Erros de infra não vazam para o domínio |
| Autorização no Service | Garante checagem independente do ponto de entrada |
