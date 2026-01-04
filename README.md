# Como usar o AuthContext & AuthProvider

## API Routes
```ts
// app/api/users/route.ts
import { requireAuth } from '@/interface-adapters/guards/require-auth'
import { makeGetUsersUseCase } from '@/application/use-cases/factories/make-get-users'

export async function GET() {
  // Verificar autenticação
  const { user, error } = await requireAuth()
  if (error) return error

  // Executar use case
  const getUsers = makeGetUsersUseCase()
  const result = await getUsers.execute()

  return Response.json(result.data, { status: result.statusCode })
}
```

```ts
// app/api/users/[id]/route.ts
import { requireAuth } from '@/interface-adapters/guards/require-auth'
import { makeGetUserByIdUseCase } from '@/application/use-cases/factories/make-get-user-by-id'

export async function GET() {
  // Verificar autenticação
  const { user, error } = await requireAuth()
  if (error) return error

  // Executar use case
  const getUserById = makeGetUserByIdUseCase()
  const result = await getUserById.execute()

  return Response.json(result.data, { status: result.statusCode })
}
```

```ts
// app/api/admin/users/route.ts
import { requireAdmin } from '@/interface-adapters/guards/require-admin'
import { makeDeleteUserUseCase } from '@/application/use-cases/factories/make-delete-user'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Verificar se é admin
  const { user, error } = await requireAdmin()
  if (error) return error

  const deleteUser = makeDeleteUserUseCase()
  const result = await deleteUser.execute({ id: params.id })

  return Response.json(result.data, { status: result.statusCode })
}
```

## Server Components
```tsx
// app/dashboard/page.tsx
import { getAuthUser } from '@/interface-adapters/guards/require-auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <h1>Bem-vindo, {user.nome}</h1>
      <p>Email: {user.email}</p>
      {user.admin === 1 && <p>Você é admin</p>}
    </div>
  )
}
```

## Client Components
```tsx
// app/layout.tsx
import { AuthProvider } from '@/interface-adapters/hooks/use-auth'
import { getAuthUser } from '@/interface-adapters/guards/require-auth'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider user={user}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

```tsx
// app/components/user-menu.tsx
'use client'

import { useAuth } from '@/interface-adapters/hooks/use-auth'

export function UserMenu() {
  const { user, isAdmin } = useAuth()

  if (!user) return null

  return (
    <div>
      <span>{user.nome}</span>
      {isAdmin && <span>Admin</span>}
    </div>
  )
}
```
