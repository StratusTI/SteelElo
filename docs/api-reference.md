# Referencia da API - Elo (Gestao Agil)

Documentacao completa da API para gestao agil de projetos com suporte a Kanban, Scrum e SAFe.

## Informacoes Gerais

| Campo | Valor |
|-------|-------|
| Versao | 1.0.0 |
| Especificacao | OpenAPI 3.1.0 |
| Contato | contato@stratustelecom.com.br |

### Servidores

| Ambiente | URL |
|----------|-----|
| Producao | `https://elo.stratustelecom.com.br:44385/api` |
| Desenvolvimento | `http://localhost:3000/api` |

### Autenticacao

A API utiliza autenticacao via cookie JWT HttpOnly:

```
Cookie: auth_token=<jwt_token>
```

| Cookie | Tipo | Duracao | Descricao |
|--------|------|---------|-----------|
| `auth_token` | HttpOnly | 1 hora | Token JWT principal |
| `refresh_token` | HttpOnly | 7 dias | Token para renovacao |

---

## Autenticacao

### GET /auth/me

Retorna dados do usuario autenticado.

**Autenticacao:** Requerida

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User data retrieved successfully",
  "data": {
    "id": 1,
    "nome": "Joao",
    "sobrenome": "Silva",
    "nomeCompleto": "Joao Silva",
    "email": "joao.silva@exemplo.com",
    "foto": "https://exemplo.com/fotos/joao.jpg",
    "telefone": "(11) 98765-4321",
    "admin": false,
    "superadmin": false,
    "idempresa": 1,
    "departamento": "TI",
    "time": "Desenvolvimento",
    "online": true
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication token not found",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

---

### POST /auth/logout

Remove o token de autenticacao e encerra a sessao.

**Autenticacao:** Requerida

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged out successfully",
  "data": {
    "message": "Logout successful"
  }
}
```

---

## Projetos

### GET /projects

Lista projetos com suporte a filtros e paginacao.

**Autenticacao:** Requerida

**Query Parameters:**

| Param | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| search | string | Nao | Busca por nome ou descricao |
| status | string[] | Nao | Filtro por status (virgula separado) |
| prioridade | string[] | Nao | Filtro por prioridade (virgula separado) |
| ownerId | integer | Nao | Filtrar por ID do proprietario |
| memberId | integer | Nao | Filtrar projetos onde usuario e membro |
| orderBy | string | Nao | Campo para ordenacao (default: updatedAt) |
| orderDirection | string | Nao | Direcao: asc ou desc (default: desc) |
| page | integer | Nao | Pagina atual (default: 1) |
| limit | integer | Nao | Itens por pagina (default: 20, max: 100) |

**Valores de Status:**
- `draft` - Rascunho
- `planning` - Planejamento
- `execution` - Execucao
- `monitoring` - Monitoramento
- `completed` - Concluido
- `cancelled` - Cancelado

**Valores de Prioridade:**
- `urgent` - Urgente
- `high` - Alta
- `medium` - Media
- `low` - Baixa
- `none` - Nenhuma

**Valores de OrderBy:**
- `nome`
- `createdAt`
- `updatedAt`
- `dataInicio`
- `dataFim`

**Exemplo de Request:**
```
GET /api/projects?search=gestao&status=planning,execution&prioridade=high&page=1&limit=10
```

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "projects": [
      {
        "id": 1,
        "nome": "Sistema de Gestao",
        "projectId": "SGE-001",
        "descricao": "Sistema completo de gestao empresarial",
        "icone": "📊",
        "backgroundUrl": "https://exemplo.com/bg.jpg",
        "dataInicio": "2024-01-20T00:00:00.000Z",
        "dataFim": "2024-06-30T00:00:00.000Z",
        "status": "planning",
        "prioridade": "high",
        "acesso": true,
        "ownerId": 1,
        "idempresa": 1,
        "createdAt": "2024-01-19T20:00:00.000Z",
        "updatedAt": "2024-01-19T20:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### POST /projects/create

Cria um novo projeto. O usuario autenticado e adicionado automaticamente como owner.

**Autenticacao:** Requerida

**Request Body:**

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| nome | string | Sim | Nome do projeto (3-255 chars) |
| projectId | string | Nao | Codigo identificador (max 10 chars) |
| descricao | string | Nao | Descricao detalhada |
| icone | string | Nao | Emoji/icone (max 50 chars) |
| backgroundUrl | string | Nao | URL da imagem de fundo |
| status | enum | Nao | Status inicial (default: draft) |
| prioridade | enum | Nao | Prioridade (default: medium) |
| dataInicio | datetime | Nao | Data de inicio planejada |
| dataFim | datetime | Nao | Data de termino planejada |
| acesso | boolean | Nao | Publico/privado (default: true) |

**Exemplo Minimo:**
```json
{
  "nome": "Projeto Teste"
}
```

**Exemplo Completo:**
```json
{
  "nome": "Sistema de Gestao Empresarial",
  "projectId": "SGE-001",
  "descricao": "Sistema completo de gestao empresarial com modulos financeiro, RH e vendas",
  "icone": "📊",
  "backgroundUrl": "https://exemplo.com/bg.jpg",
  "status": "planning",
  "prioridade": "high",
  "dataInicio": "2024-01-20T00:00:00.000Z",
  "dataFim": "2024-06-30T00:00:00.000Z",
  "acesso": true
}
```

**Response 201:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Project created successfully",
  "data": {
    "project": {
      "id": 1,
      "nome": "Sistema de Gestao Empresarial",
      "projectId": "SGE-001",
      "status": "planning",
      "prioridade": "high",
      "ownerId": 1,
      "idempresa": 1,
      "createdAt": "2024-01-19T20:00:00.000Z"
    }
  }
}
```

**Response 409 (Conflito):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Project name already exists in this company",
  "error": {
    "code": "CONFLICT"
  }
}
```

**Response 422 (Validacao):**
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Invalid request data",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": [
        {
          "path": ["nome"],
          "message": "String must contain at least 3 character(s)"
        }
      ]
    }
  }
}
```

---

### GET /projects/{id}

Retorna detalhes de um projeto especifico.

**Autenticacao:** Requerida

**Path Parameters:**

| Param | Tipo | Descricao |
|-------|------|-----------|
| id | integer | ID do projeto |

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project found",
  "data": {
    "project": {
      "id": 1,
      "nome": "Sistema de Gestao",
      "projectId": "SGE-001",
      "descricao": "Sistema completo de gestao empresarial",
      "icone": "📊",
      "backgroundUrl": "https://exemplo.com/bg.jpg",
      "dataInicio": "2024-01-20T00:00:00.000Z",
      "dataFim": "2024-06-30T00:00:00.000Z",
      "status": "planning",
      "prioridade": "high",
      "acesso": true,
      "ownerId": 1,
      "idempresa": 1,
      "createdAt": "2024-01-19T20:00:00.000Z",
      "updatedAt": "2024-01-19T20:00:00.000Z"
    }
  }
}
```

**Response 403:**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You do not have permission to access this project",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Project not found",
  "error": {
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

---

### PATCH /projects/{id}

Atualiza dados de um projeto. Apenas o owner pode atualizar.

**Autenticacao:** Requerida

**Path Parameters:**

| Param | Tipo | Descricao |
|-------|------|-----------|
| id | integer | ID do projeto |

**Request Body:**

Todos os campos sao opcionais. Envie apenas os que deseja atualizar.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| nome | string | Nome do projeto (3-255 chars) |
| projectId | string | Codigo identificador (max 10 chars) |
| descricao | string | Descricao detalhada |
| icone | string | Emoji/icone (max 50 chars) |
| backgroundUrl | string | URL da imagem de fundo |
| status | enum | Status do projeto |
| prioridade | enum | Prioridade |
| dataInicio | datetime | Data de inicio |
| dataFim | datetime | Data de termino |
| acesso | boolean | Publico/privado |

**Exemplo:**
```json
{
  "nome": "Sistema de Gestao Atualizado",
  "status": "execution",
  "prioridade": "urgent",
  "descricao": "Descricao atualizada do projeto"
}
```

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project updated successfully",
  "data": {
    "project": {
      "id": 1,
      "nome": "Sistema de Gestao Atualizado",
      "status": "execution",
      "prioridade": "urgent"
    }
  }
}
```

**Response 403:**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Only project owner can update the project",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

---

### DELETE /projects/{id}

Arquiva um projeto (soft delete). Apenas o owner pode arquivar.

**Autenticacao:** Requerida

**Path Parameters:**

| Param | Tipo | Descricao |
|-------|------|-----------|
| id | integer | ID do projeto |

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project archived successfully"
}
```

**Response 403:**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Only project owner can archive the project",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

---

## Schemas

### User

```typescript
interface User {
  id: number;              // ID unico do usuario
  nome: string;            // Primeiro nome
  sobrenome: string;       // Sobrenome
  nomeCompleto: string;    // Nome completo
  email: string;           // Email
  foto: string | null;     // URL da foto de perfil
  telefone: string | null; // Telefone
  admin: boolean;          // E administrador
  superadmin: boolean;     // E super administrador
  idempresa: number | null;// ID da empresa
  departamento: string | null; // Departamento
  time: string;            // Time/equipe
  online: boolean;         // Status online
}
```

### Project

```typescript
interface Project {
  id: number;              // ID unico
  nome: string;            // Nome do projeto
  projectId: string | null;// Codigo identificador (ex: "SGE-001")
  descricao: string | null;// Descricao detalhada
  icone: string | null;    // Emoji/icone
  backgroundUrl: string | null; // URL imagem de fundo
  dataInicio: string | null;    // Data inicio (ISO 8601)
  dataFim: string | null;       // Data fim (ISO 8601)
  status: ProjectStatus;   // Status atual
  prioridade: ProjectPriority; // Prioridade
  acesso: boolean;         // Publico/privado
  ownerId: number;         // ID do proprietario
  idempresa: number;       // ID da empresa
  createdAt: string;       // Data criacao (ISO 8601)
  updatedAt: string;       // Data atualizacao (ISO 8601)
}

type ProjectStatus =
  | 'draft'       // Rascunho
  | 'planning'    // Planejamento
  | 'execution'   // Execucao
  | 'monitoring'  // Monitoramento
  | 'completed'   // Concluido
  | 'cancelled';  // Cancelado

type ProjectPriority =
  | 'urgent'  // Urgente
  | 'high'    // Alta
  | 'medium'  // Media
  | 'low'     // Baixa
  | 'none';   // Nenhuma
```

### Pagination

```typescript
interface Pagination {
  page: number;       // Pagina atual
  limit: number;      // Itens por pagina
  total: number;      // Total de itens
  totalPages: number; // Total de paginas
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: {
    code: string;
    details?: object;
  }
}
```

---

## Codigos de Erro

| Codigo | HTTP Status | Descricao |
|--------|-------------|-----------|
| UNAUTHORIZED | 401 | Token ausente |
| INVALID_TOKEN | 401 | Token invalido ou expirado |
| INSUFFICIENT_PERMISSIONS | 403 | Sem permissao para o recurso |
| RESOURCE_NOT_FOUND | 404 | Recurso nao encontrado |
| CONFLICT | 409 | Conflito (ex: nome duplicado) |
| VALIDATION_ERROR | 422 | Dados de entrada invalidos |
| INTERNAL_ERROR | 500 | Erro interno do servidor |

---

## Exemplos de Uso

### cURL

**Listar projetos:**
```bash
curl -X GET "http://localhost:3000/api/projects?status=planning&limit=10" \
  -H "Cookie: auth_token=<token>"
```

**Criar projeto:**
```bash
curl -X POST "http://localhost:3000/api/projects/create" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<token>" \
  -d '{"nome": "Novo Projeto", "prioridade": "high"}'
```

**Atualizar projeto:**
```bash
curl -X PATCH "http://localhost:3000/api/projects/1" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<token>" \
  -d '{"status": "execution"}'
```

### JavaScript/Fetch

```javascript
// Listar projetos
const response = await fetch('/api/projects?status=planning', {
  credentials: 'include'
});
const { data } = await response.json();

// Criar projeto
const response = await fetch('/api/projects/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    nome: 'Novo Projeto',
    prioridade: 'high'
  })
});
```

---

## OpenAPI Spec

A especificacao OpenAPI completa esta disponivel em:
- Arquivo: `/public/openapi.json`
- URL: `https://elo.stratustelecom.com.br:44385/openapi.json`

Pode ser importada em ferramentas como Swagger UI, Postman ou Insomnia.
