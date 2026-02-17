# Versionamento & Changelog - Nexo

## Versionamento Semantico (SemVer)

O projeto segue o padrao **Semantic Versioning 2.0.0** com o formato:

```
MAJOR.MINOR.PATCH
  |     |     |
  |     |     └── Correcoes de bugs e ajustes menores
  |     └──────── Novas funcionalidades (retrocompativeis)
  └────────────── Mudancas incompativeis (breaking changes)
```

### Quando incrementar cada numero

| Tipo    | Quando usar                                          | Exemplo          |
| ------- | ---------------------------------------------------- | ---------------- |
| `MAJOR` | Mudancas que quebram compatibilidade (API, DB schema) | `1.0.0` → `2.0.0` |
| `MINOR` | Nova feature sem quebrar nada existente               | `1.0.0` → `1.1.0` |
| `PATCH` | Bug fix, ajuste de estilo, correcao de typo           | `1.0.0` → `1.0.1` |

### Regras

1. **Versao inicial**: Comeca em `0.1.0` (desenvolvimento ativo, API instavel)
2. **Pre-release**: Antes do `1.0.0`, qualquer mudanca pode ocorrer sem incrementar MAJOR
3. **Primeiro release estavel**: `1.0.0` marca a primeira versao publica estavel
4. **PATCH reseta** quando MINOR incrementa: `1.2.3` → `1.3.0`
5. **MINOR e PATCH resetam** quando MAJOR incrementa: `1.5.2` → `2.0.0`

---

## Versao Atual

```json
// package.json
{
  "version": "0.1.0"
}
```

> Enquanto estivermos em `0.x.x`, o projeto esta em desenvolvimento ativo e a API pode mudar livremente.

---

## Formato do Changelog

O changelog deve ser mantido no arquivo `CHANGELOG.md` na raiz do projeto, seguindo o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

### Estrutura

```markdown
# Changelog

## [Unreleased]

### Adicionado
- Descricao da nova feature

### Modificado
- Descricao da mudanca em feature existente

### Corrigido
- Descricao do bug fix

### Removido
- Descricao do que foi removido

---

## [0.2.0] - 2026-02-20

### Adicionado
- Sistema de Wiki com CRUD completo de documentos
- Visualizacao de documentos privados e publicos

### Corrigido
- Alinhamento de tipos de ID com schema Prisma Elo

---

## [0.1.0] - 2026-01-15

### Adicionado
- Setup inicial do projeto (Next.js, Prisma, TailwindCSS)
- Sistema de autenticacao
- Pagina de login
- CRUD de stickies
- Quick-links na home
```

### Categorias permitidas

| Categoria      | Uso                                              |
| -------------- | ------------------------------------------------ |
| `Adicionado`   | Novas funcionalidades                            |
| `Modificado`   | Mudancas em funcionalidades existentes           |
| `Obsoleto`     | Features que serao removidas em versoes futuras  |
| `Removido`     | Features removidas                               |
| `Corrigido`    | Bug fixes                                        |
| `Seguranca`    | Correcoes de vulnerabilidades                    |

---

## Como atualizar a versao

### 1. Atualizar o `package.json`

```bash
# Incrementar PATCH (0.1.0 → 0.1.1)
pnpm version patch --no-git-tag-version

# Incrementar MINOR (0.1.0 → 0.2.0)
pnpm version minor --no-git-tag-version

# Incrementar MAJOR (0.1.0 → 1.0.0)
pnpm version major --no-git-tag-version
```

> A flag `--no-git-tag-version` evita que o pnpm crie um commit e tag automaticamente, permitindo controle manual.

### 2. Atualizar o `CHANGELOG.md`

1. Mover itens de `[Unreleased]` para a nova versao
2. Adicionar a data no formato `AAAA-MM-DD`
3. Criar nova secao `[Unreleased]` vazia

### 3. Criar o commit de release

```bash
git add package.json CHANGELOG.md
git commit -m "release: v0.2.0"
```

### 4. Criar a tag

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

---

## Fluxo de trabalho

```
Desenvolvimento
     |
     v
Commits com prefixos (feat, fix, style, etc.)
     |
     v
Adicionar entradas em [Unreleased] no CHANGELOG
     |
     v
Quando pronto para release:
  1. Definir nova versao (MAJOR/MINOR/PATCH)
  2. Mover [Unreleased] para a nova versao
  3. pnpm version <tipo> --no-git-tag-version
  4. Commit de release + tag
  5. Push com tags
```

---

## Prefixos de Commit (Conventional Commits)

Os commits do projeto seguem o padrao **Conventional Commits**, que facilita a geracao do changelog:

| Prefixo      | Descricao                          | Impacto na versao |
| ------------ | ---------------------------------- | ----------------- |
| `feat:`      | Nova funcionalidade                | MINOR             |
| `fix:`       | Correcao de bug                    | PATCH             |
| `style:`     | Formatacao, lint (sem logica)      | PATCH             |
| `refactor:`  | Refatoracao sem mudar comportamento| PATCH             |
| `test:`      | Adicao/correcao de testes          | -                 |
| `chore:`     | Tarefas de manutencao              | -                 |
| `docs:`      | Documentacao                       | -                 |
| `perf:`      | Melhoria de performance            | PATCH             |
| `release:`   | Commit de release                  | -                 |

### Exemplos do projeto

```
feat: add basic document views (private and public)
fix(test): mock enrich functions in documents integration tests
fix(types): align ID types with Prisma Elo schema (String cuid)
style(fix): biome lint config
chore: update slack-secret
```

### Breaking changes

Para mudancas que quebram compatibilidade, adicionar `!` apos o prefixo:

```
feat!: redesign document API response format
fix!: change authentication flow to OAuth2
```
