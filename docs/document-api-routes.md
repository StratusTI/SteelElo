# API de Documentos — Referencia para Insomnia

Base URL: `http://localhost:3000`

Todas as rotas (exceto `/api/documents/public/:token`) exigem autenticacao.
Inclua o cookie de sessao no Insomnia (copie do navegador apos fazer login).

---

## 1. Listar Documentos

```
GET /api/documents
```

**Query params (todos opcionais):**

| Param      | Tipo   | Descricao                                      |
|------------|--------|-------------------------------------------------|
| `status`   | string | `draft`, `published`, `private` ou `archived`   |
| `search`   | string | Termo de busca no titulo                        |
| `parentId` | string | ID do pai ou `"null"` para documentos raiz      |
| `empresaId`| number | ID da empresa (default: empresa do usuario)     |

**Exemplos:**

```
GET /api/documents
GET /api/documents?status=draft
GET /api/documents?status=published&search=onboarding
GET /api/documents?parentId=null
GET /api/documents?parentId=5
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": 1,
        "titulo": "Guia de Onboarding",
        "icone": "📘",
        "conteudo": "# Bem-vindo...",
        "status": "draft",
        "parentId": null,
        "projetoId": null,
        "empresaId": 1,
        "createdBy": 42,
        "isFullWidth": false,
        "publicShareToken": null,
        "ordem": 0,
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T12:00:00.000Z",
        "creator": {
          "id": 42,
          "username": "gustavo",
          "foto": "foto.jpg"
        }
      }
    ]
  }
}
```

---

## 2. Criar Documento

```
POST /api/documents
Content-Type: application/json
```

**Body:**

| Campo       | Tipo   | Obrigatorio | Descricao                     |
|-------------|--------|-------------|-------------------------------|
| `titulo`    | string | Sim         | Titulo (min 1 caractere)      |
| `icone`     | string | Nao         | Emoji ou nome do icone        |
| `conteudo`  | string | Nao         | Conteudo markdown             |
| `parentId`  | number | Nao         | ID do documento pai           |
| `empresaId` | number | Nao         | ID da empresa                 |
| `projetoId` | number | Nao         | ID do projeto                 |
| `status`    | string | Nao         | `draft`, `published`, `private`, `archived` |

**Exemplo — documento simples:**
```json
{
  "titulo": "Novo Documento de Teste"
}
```

**Exemplo — documento completo:**
```json
{
  "titulo": "Politica de Ferias",
  "icone": "🏖️",
  "conteudo": "# Politica de Ferias\n\n## Regras Gerais\n\nTodo colaborador tem direito a 30 dias...",
  "status": "draft",
  "projetoId": 1
}
```

**Exemplo — documento filho (nested):**
```json
{
  "titulo": "Sub-pagina do Onboarding",
  "parentId": 1
}
```

**Resposta 201:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": 10,
      "titulo": "Novo Documento de Teste",
      "icone": null,
      "conteudo": null,
      "status": "draft",
      "parentId": null,
      "projetoId": null,
      "empresaId": 1,
      "createdBy": 42,
      "isFullWidth": false,
      "publicShareToken": null,
      "ordem": 0,
      "createdAt": "2025-01-20T14:00:00.000Z",
      "updatedAt": "2025-01-20T14:00:00.000Z",
      "creator": {
        "id": 42,
        "username": "gustavo",
        "foto": "foto.jpg"
      }
    }
  },
  "message": "Document created successfully"
}
```

---

## 3. Buscar Documento por ID

```
GET /api/documents/:id
```

**Exemplo:**
```
GET /api/documents/1
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": 1,
      "titulo": "Guia de Onboarding",
      "icone": "📘",
      "conteudo": "# Bem-vindo...",
      "status": "draft",
      "parentId": null,
      "projetoId": null,
      "empresaId": 1,
      "createdBy": 42,
      "isFullWidth": false,
      "publicShareToken": null,
      "ordem": 0,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T12:00:00.000Z",
      "creator": {
        "id": 42,
        "username": "gustavo",
        "foto": "foto.jpg"
      }
    },
    "isFavorite": false
  }
}
```

---

## 4. Atualizar Documento

```
PATCH /api/documents/:id
Content-Type: application/json
```

Somente o dono do documento pode atualizar.

**Body (todos opcionais):**

| Campo         | Tipo    | Descricao                                     |
|---------------|---------|------------------------------------------------|
| `titulo`      | string  | Novo titulo (min 1 caractere)                  |
| `icone`       | string  | Emoji ou nome do icone                         |
| `conteudo`    | string  | Conteudo markdown                              |
| `status`      | string  | `draft`, `published`, `private`, `archived`    |
| `isFullWidth` | boolean | Largura total no editor                        |

**Exemplo — atualizar titulo:**
```
PATCH /api/documents/1
```
```json
{
  "titulo": "Guia de Onboarding v2"
}
```

**Exemplo — atualizar conteudo:**
```
PATCH /api/documents/1
```
```json
{
  "conteudo": "# Guia Atualizado\n\nNovo conteudo aqui..."
}
```

**Exemplo — trocar status para privado:**
```
PATCH /api/documents/1
```
```json
{
  "status": "private"
}
```

**Exemplo — ativar largura total:**
```
PATCH /api/documents/1
```
```json
{
  "isFullWidth": true
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "document": { "..." : "documento atualizado" }
  },
  "message": "Document updated successfully"
}
```

---

## 5. Deletar Documento

```
DELETE /api/documents/:id
```

Somente o dono pode deletar. Sem body.

**Exemplo:**
```
DELETE /api/documents/10
```

**Resposta 200:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## 6. Arvore de Documentos

```
GET /api/documents/tree
```

Retorna documentos organizados em arvore hierarquica (pai -> filhos).

**Query params (opcionais):**

| Param       | Tipo   | Descricao                                 |
|-------------|--------|-------------------------------------------|
| `empresaId` | number | ID da empresa (default: empresa do usuario)|

**Exemplo:**
```
GET /api/documents/tree
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "tree": [
      {
        "id": 1,
        "titulo": "Guia de Onboarding",
        "icone": "📘",
        "status": "draft",
        "parentId": null,
        "ordem": 0,
        "children": [
          {
            "id": 2,
            "titulo": "Dia 1",
            "icone": null,
            "status": "draft",
            "parentId": 1,
            "ordem": 0,
            "children": []
          }
        ]
      }
    ]
  }
}
```

---

## 7. Arquivar Documento

```
POST /api/documents/:id/archive
```

Sem body. Somente o dono pode arquivar. Documento ja arquivado retorna erro.

**Exemplo:**
```
POST /api/documents/1/archive
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "document": { "...": "documento com status archived" }
  },
  "message": "Document archived successfully"
}
```

**Erro 409 (ja arquivado):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Document is already archived"
  }
}
```

Para **desarquivar**, use `PATCH /api/documents/:id` com `{ "status": "draft" }`.

---

## 8. Publicar Documento

```
POST /api/documents/:id/publish
```

Sem body. Somente o dono pode publicar. Gera um `publicShareToken` unico.

**Exemplo:**
```
POST /api/documents/1/publish
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": 1,
      "status": "published",
      "publicShareToken": "abc123def456..."
    }
  },
  "message": "Document published successfully"
}
```

Para **despublicar**, use `PATCH /api/documents/:id` com `{ "status": "draft" }`.

---

## 9. Duplicar Documento

```
POST /api/documents/:id/duplicate
```

Sem body. Cria copia do documento.

**Exemplo:**
```
POST /api/documents/1/duplicate
```

**Resposta 201:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": 11,
      "titulo": "Guia de Onboarding (copia)",
      "status": "draft",
      "..."  : "..."
    }
  },
  "message": "Document duplicated successfully"
}
```

---

## 10. Favoritar / Desfavoritar Documento

```
POST /api/documents/:id/favorite
```

Sem body. Toggle: se ja e favorito, remove; se nao e, adiciona.

**Exemplo:**
```
POST /api/documents/1/favorite
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```

---

## 11. Mover Documento

```
PATCH /api/documents/:id/move
Content-Type: application/json
```

Move para outro pai e/ou outro projeto. Somente o dono pode mover.
Valida referencia circular (nao pode mover para um filho proprio).

**Body:**

| Campo       | Tipo         | Obrigatorio | Descricao                        |
|-------------|--------------|-------------|----------------------------------|
| `parentId`  | number/null  | Sim         | ID do novo pai ou `null` (raiz)  |
| `ordem`     | number       | Nao         | Posicao na lista (min 0)         |
| `projetoId` | number/null  | Nao         | ID do projeto destino ou `null`  |

**Exemplo — mover para raiz:**
```
PATCH /api/documents/2/move
```
```json
{
  "parentId": null
}
```

**Exemplo — mover para dentro de outro documento:**
```
PATCH /api/documents/3/move
```
```json
{
  "parentId": 1,
  "ordem": 2
}
```

**Exemplo — mover para outro projeto:**
```
PATCH /api/documents/3/move
```
```json
{
  "parentId": null,
  "projetoId": 5
}
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "document": { "...": "documento movido" }
  },
  "message": "Document moved successfully"
}
```

**Erro 409 (referencia circular):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Circular reference detected"
  }
}
```

---

## 12. Listar Versoes do Documento

```
GET /api/documents/:id/versions
```

**Exemplo:**
```
GET /api/documents/1/versions
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "id": 1,
        "documentId": 1,
        "versao": 1,
        "titulo": "Guia de Onboarding",
        "conteudo": "# Conteudo original...",
        "createdAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": 2,
        "documentId": 1,
        "versao": 2,
        "titulo": "Guia de Onboarding v2",
        "conteudo": "# Conteudo atualizado...",
        "createdAt": "2025-01-16T14:00:00.000Z"
      }
    ]
  }
}
```

---

## 13. Buscar Versao Especifica

```
GET /api/documents/:id/versions/:version
```

**Exemplo:**
```
GET /api/documents/1/versions/2
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "version": {
      "id": 2,
      "documentId": 1,
      "versao": 2,
      "titulo": "Guia de Onboarding v2",
      "conteudo": "# Conteudo atualizado...",
      "createdAt": "2025-01-16T14:00:00.000Z"
    }
  }
}
```

---

## 14. Documento Publico (sem autenticacao)

```
GET /api/documents/public/:token
```

Unica rota que **nao exige autenticacao**. O token vem do campo `publicShareToken` apos publicar.

**Exemplo:**
```
GET /api/documents/public/abc123def456
```

**Resposta 200:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": 1,
      "titulo": "Guia de Onboarding",
      "conteudo": "# Bem-vindo...",
      "status": "published",
      "publicShareToken": "abc123def456"
    }
  }
}
```

---

## Erros Comuns

| Codigo HTTP | Code                  | Quando                                       |
|-------------|-----------------------|----------------------------------------------|
| 400         | `BAD_REQUEST`         | ID invalido ou body mal formatado            |
| 401         | `UNAUTHORIZED`        | Cookie de sessao ausente ou expirado         |
| 403         | `FORBIDDEN`           | Nao e dono do documento                      |
| 404         | `RESOURCE_NOT_FOUND`  | Documento nao encontrado                     |
| 409         | `CONFLICT`            | Ja arquivado ou referencia circular          |
| 422         | `VALIDATION_ERROR`    | Body nao passou na validacao Zod             |
| 500         | `INTERNAL_SERVER_ERROR`| Erro inesperado no servidor                 |

**Formato de erro:**
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Document not found"
  }
}
```

---

## Fluxo de Teste Sugerido

1. `POST /api/documents` — Criar documento de teste
2. `GET /api/documents` — Listar e confirmar que aparece
3. `GET /api/documents/:id` — Buscar por ID
4. `PATCH /api/documents/:id` — Atualizar titulo e conteudo
5. `POST /api/documents/:id/publish` — Publicar
6. `GET /api/documents/public/:token` — Acessar via token publico (sem auth)
7. `PATCH /api/documents/:id` com `{ "status": "draft" }` — Despublicar
8. `POST /api/documents` com `parentId` — Criar documento filho
9. `PATCH /api/documents/:id/move` — Mover filho para raiz
10. `PATCH /api/documents/:id/move` com `projetoId` — Mover para projeto
11. `POST /api/documents/:id/favorite` — Favoritar
12. `POST /api/documents/:id/favorite` — Desfavoritar (toggle)
13. `POST /api/documents/:id/duplicate` — Duplicar
14. `GET /api/documents/:id/versions` — Ver historico
15. `POST /api/documents/:id/archive` — Arquivar
16. `PATCH /api/documents/:id` com `{ "status": "draft" }` — Desarquivar
17. `GET /api/documents/tree` — Ver arvore completa
18. `DELETE /api/documents/:id` — Deletar documento de teste
