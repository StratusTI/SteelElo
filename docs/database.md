# Documentacao do Banco de Dados - Nexo

O projeto Nexo utiliza dois schemas separados no MySQL, gerenciados pelo Prisma ORM.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Nexo Application                       │
├─────────────────────────────────────────────────────────────┤
│                      Prisma Client                          │
├──────────────────────────┬──────────────────────────────────┤
│     prismaSteel          │         prismaElo                │
│  (usuarios/empresas)     │      (projetos/tarefas)          │
├──────────────────────────┼──────────────────────────────────┤
│  DATABASE_STEEL_URL      │      DATABASE_ELO_URL            │
│       MySQL              │           MySQL                  │
└──────────────────────────┴──────────────────────────────────┘
```

---

## Schema Steel (Usuarios e Empresas)

Localizado em: `prisma/steel/schema.prisma`

### Tabelas Principais

#### Usuario (`usuarios`)

Armazena dados de todos os usuarios do sistema.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| nome | String | Primeiro nome |
| sobrenome | String | Sobrenome |
| email | String | Email (unico) |
| username | String | Nome de usuario (unico) |
| senha | String | Senha hash |
| foto | String | URL da foto de perfil |
| telefone | String | Telefone |
| admin | Boolean | E administrador da empresa |
| superadmin | Boolean | E super administrador |
| idempresa | Int | FK para empresa |
| departamento | String | Departamento |
| online | Boolean | Esta online |
| last_seen | DateTime | Ultimo acesso |

**Indices:**
- `email` (unico)
- `username` (unico)
- `idempresa`
- `idx_usuarios_dev_online_seen` (iddevice, online, last_seen)

**Relacionamentos:**
- `empresa` → Empresa (N:1)
- `integracoes` → integracao_usuario (1:N)
- `horarios_padrao` → horarios_padrao (1:N)
- `ponto` → ponto (1:N)

#### Empresa (`empresa`)

Armazena dados das empresas/organizacoes.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| nome | String | Nome da empresa |
| cnpj | String | CNPJ |
| endereco | String | Endereco completo |
| cep | String | CEP |
| coordenadas | String | Lat/Lng |
| logo_empresa | Text | Logo em base64 ou URL |
| status | String | Status da empresa |

**Relacionamentos:**
- `usuarios` → Usuario (1:N)

#### integracao_usuario

Armazena tokens de integracao com providers externos (Slack, etc).

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| usuario_id | Int | FK para usuario |
| provider | String | Nome do provider (slack, google, etc) |
| provider_id | String | ID do usuario no provider |
| access_token | Text | Token de acesso |
| refresh_token | Text | Token de refresh |
| token_expires | DateTime | Data de expiracao |
| scopes | Text | Escopos autorizados |

**Indices:**
- `usuario_id, provider` (unico)

---

## Schema Elo (Projetos e Tarefas)

Localizado em: `prisma/elo/schema.prisma`

### Diagrama ER Simplificado

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Projeto   │────<│  ProjetoMembro   │>────│   Usuario   │
└─────────────┘     └──────────────────┘     │   (Steel)   │
       │                                      └─────────────┘
       │
       ├────< Sprint >────< UserStory >────< Tarefa
       │
       ├────< Coluna >────< Tarefa
       │
       ├────< Documento
       │
       ├────< Tag >────< TarefaTag >────< Tarefa
       │
       └────< Atividade
```

### Tabelas Principais

#### Projeto (`projetos`)

Tabela central de projetos.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| nome | String(255) | Nome do projeto |
| projectId | String(10) | ID curto unico (ex: "PRJ-001") |
| descricao | Text | Descricao completa |
| icone | String(50) | Emoji ou icone |
| backgroundUrl | String(255) | URL imagem de fundo |
| dataInicio | Date | Data de inicio |
| dataFim | Date | Data de fim prevista |
| ownerId | Int | FK usuario criador |
| idempresa | Int | FK empresa |
| status | Enum | draft, active, paused, completed, archived |
| prioridade | Enum | none, low, medium, high, critical |
| acesso | Boolean | Projeto acessivel |
| createdAt | DateTime | Data de criacao |
| updatedAt | DateTime | Ultima atualizacao |

**Indices:**
- `idx_empresa` (idempresa, status)
- `idx_owner` (ownerId)
- `idx_status` (status)
- `idx_empresa_owner` (idempresa, ownerId)
- `idx_status_created` (status, createdAt)

**Relacionamentos:**
- `membros` → ProjetoMembro (1:N)
- `colunas` → Coluna (1:N)
- `tarefas` → Tarefa (1:N)
- `sprints` → Sprint (1:N)
- `userStories` → UserStory (1:N)
- `documentos` → Documento (1:N)
- `tags` → Tag (1:N)
- `atividades` → Atividade (1:N)

#### ProjetoMembro (`projeto_membros`)

Relacionamento N:N entre projetos e usuarios.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| projetoId | Int | FK projeto |
| usuarioId | Int | FK usuario |
| role | Enum | owner, admin, member, viewer |
| source | String | direct, team, department |
| adicionadoEm | DateTime | Data de adicao |

**Indices:**
- `uniq_projeto_usuario_source` (projetoId, usuarioId, source) - unico
- `idx_projeto` (projetoId)
- `idx_usuario` (usuarioId)

#### Coluna (`colunas`)

Colunas do quadro Kanban.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| titulo | String(100) | Nome da coluna |
| ordem | Int | Posicao no quadro |
| cor | String(7) | Cor hex (#ffffff) |
| projetoId | Int | FK projeto |

**Indices:**
- `idx_projeto` (projetoId)
- `idx_ordem` (ordem)

#### Tarefa (`tarefas`)

Tarefas/cards do Kanban.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| titulo | String(255) | Titulo da tarefa |
| descricao | Text | Descricao completa |
| data_inicio | Date | Data de inicio |
| data_fim | Date | Data de fim |
| status | Enum | backlog, todo, doing, review, done, blocked |
| prioridade | Enum | none, low, medium, high, critical |
| ordem | Int | Posicao na coluna |
| estimativaHoras | Decimal | Horas estimadas |
| horasRealizadas | Decimal | Horas gastas |
| colunaId | Int | FK coluna |
| projetoId | Int | FK projeto |
| userStoryId | Int | FK user story (opcional) |
| createdBy | Int | FK usuario criador |

**Indices:**
- `idx_coluna` (colunaId)
- `idx_projeto` (projetoId)
- `idx_story` (userStoryId)
- `idx_created_by` (createdBy)
- `idx_projeto_coluna` (projetoId, colunaId)
- `idx_kanban_view` (colunaId, status, ordem)

**Relacionamentos:**
- `coluna` → Coluna (N:1)
- `projeto` → Projeto (N:1)
- `userStory` → UserStory (N:1)
- `responsaveis` → TarefaResponsavel (1:N)
- `subtarefas` → Subtarefa (1:N)
- `comentarios` → Comentario (1:N)
- `anexos` → Anexo (1:N)
- `tags` → TarefaTag (1:N)

#### Sprint (`sprints`)

Sprints para metodologia agil.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| nome | String(100) | Nome da sprint |
| objetivo | Text | Objetivo da sprint |
| dataInicio | Date | Data de inicio |
| dataFim | Date | Data de fim |
| capacidadePlanejada | Decimal | Capacidade planejada |
| capacidadeRealizada | Decimal | Capacidade realizada |
| velocidade | Decimal | Velocidade do time |
| status | Enum | planejamento, ativo, concluido, cancelado |
| projetoId | Int | FK projeto |

**Indices:**
- `idx_projeto` (projetoId)
- `idx_status` (status)
- `idx_datas` (dataInicio, dataFim)
- `idx_projeto_status` (projetoId, status)

#### UserStory (`user_stories`)

User stories para backlog.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| titulo | String(255) | Titulo |
| persona | String(100) | Como [persona] |
| acao | Text | Eu quero [acao] |
| beneficio | Text | Para que [beneficio] |
| criteriosAceitacao | Text | Criterios de aceitacao |
| storyPoints | Decimal | Story points |
| estimativaHoras | Decimal | Horas estimadas |
| prioridade | Int | Prioridade numerica |
| status | Enum | backlog, ready, doing, done |
| projetoId | Int | FK projeto |
| sprintId | Int | FK sprint (opcional) |

#### Documento (`documentos`)

Wiki/documentacao do projeto.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| titulo | String(255) | Titulo do documento |
| conteudo | LongText | Conteudo em JSON/Markdown |
| tipo | Enum | page, folder |
| parentId | Int | FK documento pai (hierarquia) |
| ordem | Int | Posicao na lista |
| projetoId | Int | FK projeto |
| createdBy | Int | FK usuario criador |

**Indices:**
- `idx_projeto` (projetoId)
- `idx_parent` (parentId)
- `idx_hierarchy` (parentId, ordem)

#### Atividade (`atividades`)

Feed de atividades do projeto.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | Int | ID auto-incrementado |
| tipo | String | Tipo da atividade |
| descricao | Text | Descricao formatada |
| entidadeId | Int | ID da entidade relacionada |
| entidadeTipo | String | Tipo da entidade |
| visibilidade | Enum | public, private, team |
| projetoId | Int | FK projeto |
| usuarioId | Int | FK usuario que realizou |

**Indices:**
- `idx_projeto` (projetoId)
- `idx_feed` (projetoId, visibilidade, createdAt)

---

## Enums

### Schema Elo

```prisma
enum ProjetoStatus {
  draft
  active
  paused
  completed
  archived
}

enum ProjetoPriority {
  none
  low
  medium
  high
  critical
}

enum ProjetoMemberRole {
  owner
  admin
  member
  viewer
}

enum TarefaStatus {
  backlog
  todo
  doing
  review
  done
  blocked
}

enum TarefaPrioridade {
  none
  low
  medium
  high
  critical
}

enum SprintStatus {
  planejamento
  ativo
  concluido
  cancelado
}

enum UserStoryStatus {
  backlog
  ready
  doing
  done
}
```

---

## Comandos Prisma

```bash
# Gerar cliente Prisma
pnpm prisma generate --schema=prisma/steel/schema.prisma
pnpm prisma generate --schema=prisma/elo/schema.prisma

# Criar migration
pnpm prisma migrate dev --schema=prisma/steel/schema.prisma --name nome_migration
pnpm prisma migrate dev --schema=prisma/elo/schema.prisma --name nome_migration

# Push sem migration (dev)
pnpm prisma db push --schema=prisma/steel/schema.prisma
pnpm prisma db push --schema=prisma/elo/schema.prisma

# Abrir Prisma Studio
pnpm prisma studio --schema=prisma/steel/schema.prisma
pnpm prisma studio --schema=prisma/elo/schema.prisma

# Verificar schema
pnpm prisma validate --schema=prisma/steel/schema.prisma
pnpm prisma validate --schema=prisma/elo/schema.prisma
```

---

## Boas Praticas

### Indices

1. Sempre adicione indices para campos usados em WHERE
2. Crie indices compostos para queries frequentes
3. Evite indices em campos com baixa cardinalidade

### Queries

1. Use `select` para limitar campos retornados
2. Use `include` com moderacao (evite over-fetching)
3. Prefira `Promise.all` para queries paralelas
4. Use transacoes para operacoes atomicas

### Migrations

1. Sempre crie migrations para alteracoes de schema
2. Teste migrations em ambiente de desenvolvimento
3. Faca backup antes de migrations em producao
4. Use nomes descritivos para migrations
