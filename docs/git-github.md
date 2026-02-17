# Git & GitHub - Nexo

## Configuracao inicial

```bash
# Configurar identidade (primeira vez)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Verificar configuracao
git config --list
```

---

## Comandos essenciais

### Status e informacoes

```bash
# Ver estado dos arquivos (modificados, staged, untracked)
git status

# Ver historico de commits
git log --oneline

# Ver historico detalhado com grafico de branches
git log --oneline --graph --all

# Ver diferencas nos arquivos modificados
git diff

# Ver diferencas dos arquivos em staging
git diff --staged
```

### Staging e commits

```bash
# Adicionar arquivo especifico ao staging
git add <arquivo>

# Adicionar todos os arquivos modificados
git add .

# Criar commit
git commit -m "feat: descricao da mudanca"

# Adicionar ao staging e commitar de uma vez (apenas arquivos rastreados)
git commit -am "fix: descricao do fix"
```

### Desfazer mudancas

```bash
# Descartar mudancas em arquivo especifico (nao commitado)
git checkout -- <arquivo>
# ou (versao moderna)
git restore <arquivo>

# Remover arquivo do staging (manter mudancas)
git reset HEAD <arquivo>
# ou (versao moderna)
git restore --staged <arquivo>

# Desfazer ultimo commit (manter mudancas no staging)
git reset --soft HEAD~1

# Desfazer ultimo commit (manter mudancas fora do staging)
git reset HEAD~1

# Desfazer ultimo commit (descartar mudancas) ⚠️ CUIDADO
git reset --hard HEAD~1
```

---

## Branches

### Gerenciamento de branches

```bash
# Listar branches locais
git branch

# Listar todas as branches (local + remoto)
git branch -a

# Criar nova branch
git branch <nome>

# Criar e trocar para nova branch
git checkout -b <nome>
# ou (versao moderna)
git switch -c <nome>

# Trocar de branch
git checkout <nome>
# ou (versao moderna)
git switch <nome>

# Deletar branch local (ja mergeada)
git branch -d <nome>

# Deletar branch local (forcar) ⚠️
git branch -D <nome>

# Deletar branch remota
git push origin --delete <nome>
```

### Convencao de nomes de branch

| Prefixo      | Uso                              | Exemplo                    |
| ------------ | -------------------------------- | -------------------------- |
| `feature/`   | Nova funcionalidade              | `feature/wiki`             |
| `fix/`       | Correcao de bug                  | `fix/login-redirect`       |
| `hotfix/`    | Correcao urgente em producao     | `hotfix/auth-crash`        |
| `refactor/`  | Refatoracao de codigo            | `refactor/api-routes`      |
| `chore/`     | Tarefas de manutencao            | `chore/update-deps`        |
| `docs/`      | Documentacao                     | `docs/api-reference`       |

---

## Trabalhando com remoto (origin)

### Comandos basicos

```bash
# Ver repositorios remotos configurados
git remote -v

# Baixar atualizacoes do remoto (sem aplicar)
git fetch origin

# Baixar e aplicar atualizacoes da branch atual
git pull origin <branch>

# Enviar commits para o remoto
git push origin <branch>

# Enviar nova branch para o remoto e rastrear
git push -u origin <branch>
```

### Sincronizar branch com main

```bash
# Estando na sua branch de feature
git fetch origin
git merge origin/main

# Ou usando rebase (historico mais limpo)
git fetch origin
git rebase origin/main
```

### Resolver conflitos de merge

```bash
# 1. Apos o conflito, abrir arquivos com marcadores <<<<<<<
# 2. Editar e resolver os conflitos
# 3. Marcar como resolvido
git add <arquivo-resolvido>

# 4. Continuar o merge
git commit

# Ou se estiver em rebase
git rebase --continue

# Abortar merge/rebase se necessario
git merge --abort
git rebase --abort
```

---

## Stash (guardar mudancas temporariamente)

```bash
# Guardar mudancas atuais
git stash

# Guardar com uma mensagem descritiva
git stash save "mensagem sobre o que estou guardando"

# Listar stashes
git stash list

# Aplicar ultimo stash (e manter na lista)
git stash apply

# Aplicar ultimo stash (e remover da lista)
git stash pop

# Aplicar stash especifico
git stash apply stash@{2}

# Remover stash especifico
git stash drop stash@{0}

# Limpar todos os stashes ⚠️
git stash clear
```

---

## Tags (versoes)

```bash
# Listar tags
git tag

# Criar tag anotada (recomendado para releases)
git tag -a v0.2.0 -m "Release v0.2.0"

# Criar tag leve (para uso interno)
git tag v0.2.0

# Enviar tag para o remoto
git push origin v0.2.0

# Enviar todas as tags
git push origin --tags

# Deletar tag local
git tag -d v0.2.0

# Deletar tag remota
git push origin --delete v0.2.0
```

---

## GitHub CLI (`gh`)

### Instalacao

```bash
# Windows (winget)
winget install --id GitHub.cli

# Verificar instalacao
gh --version
```

### Autenticacao

```bash
# Login interativo (abre navegador)
gh auth login

# Verificar status de autenticacao
gh auth status

# Logout
gh auth logout
```

### Pull Requests

```bash
# Criar PR da branch atual para main
gh pr create --title "feat: descricao" --body "Descricao detalhada"

# Criar PR interativamente
gh pr create

# Listar PRs abertos
gh pr list

# Ver detalhes de um PR
gh pr view <numero>

# Ver PR no navegador
gh pr view <numero> --web

# Fazer checkout de um PR
gh pr checkout <numero>

# Aprovar um PR
gh pr review <numero> --approve

# Fazer merge de um PR
gh pr merge <numero>

# Fechar um PR sem merge
gh pr close <numero>
```

### Issues

```bash
# Criar issue
gh issue create --title "Bug: descricao" --body "Detalhes"

# Listar issues abertas
gh issue list

# Ver detalhes de uma issue
gh issue view <numero>

# Fechar issue
gh issue close <numero>

# Reabrir issue
gh issue reopen <numero>
```

### Repositorio

```bash
# Clonar repositorio
gh repo clone <owner>/<repo>

# Ver informacoes do repositorio
gh repo view

# Abrir repositorio no navegador
gh repo view --web

# Listar repositorios
gh repo list

# Criar repositorio
gh repo create <nome> --private
```

### Acoes uteis

```bash
# Ver status dos checks/CI de um PR
gh pr checks <numero>

# Ver workflows do GitHub Actions
gh run list

# Ver logs de um workflow
gh run view <run-id> --log

# Re-executar workflow
gh run rewatch <run-id>
```

---

## Fluxo de trabalho do projeto

### Criando uma feature

```bash
# 1. Garantir que main esta atualizado
git checkout main
git pull origin main

# 2. Criar branch de feature
git checkout -b feature/nome-da-feature

# 3. Desenvolver e commitar (conventional commits)
git add <arquivos>
git commit -m "feat: implementar funcionalidade X"

# 4. Manter atualizado com main
git fetch origin
git merge origin/main

# 5. Enviar para o remoto
git push -u origin feature/nome-da-feature

# 6. Criar Pull Request
gh pr create --title "feat: funcionalidade X" --body "Descricao"

# 7. Apos aprovacao e merge, limpar
git checkout main
git pull origin main
git branch -d feature/nome-da-feature
```

### Corrigindo um bug

```bash
# 1. Criar branch de fix
git checkout -b fix/descricao-do-bug

# 2. Corrigir e commitar
git add <arquivos>
git commit -m "fix: corrigir problema Y"

# 3. Push e PR
git push -u origin fix/descricao-do-bug
gh pr create --title "fix: corrigir problema Y"
```

---

## Dicas uteis

### Aliases recomendados

```bash
# Configurar aliases para agilizar
git config --global alias.st "status"
git config --global alias.co "checkout"
git config --global alias.br "branch"
git config --global alias.lg "log --oneline --graph --all"
git config --global alias.last "log -1 HEAD --stat"
```

### .gitignore

Arquivos que **nunca** devem ser commitados:

```
.env
.env.local
node_modules/
.next/
*.log
```

### Verificar antes de commitar

```bash
# Ver o que sera commitado
git diff --staged

# Ver arquivos que serao incluidos
git status

# Rodar lint antes do commit
pnpm lint
```
