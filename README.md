# Validando Usuário/JWT- Cookies Headers

## API Routes
```ts
// app/api/auth/me/route.ts
import { verifyJWT } from '@/src/http/middlewares/verify-jwt';

export async function GET() {
  const { user, error } = await verifyJWT();
  if (error) return error;

  return NextResponse.json(user);
}

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const { user, error } = await verifyJWT({ email, password });
  if (error) return error;

  return NextResponse.json(user);
}
```

```ts
// app/api/users/[id]/route.ts
import { verifyJWT } from '@/src/http/middlewares/verify-jwt';

export async function GET() {
  const { user, error } = await verifyJWT();
  if (error) return error;

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const { user, error } = await verifyJWT();
  if (error) return error;

  const { name, email } = await request.json();
  const { user: updatedUser, error: updateError } = await updateUser({ id: user.id, name, email });
  if (updateError) return updateError;

  return NextResponse.json(updatedUser);
}
```

## Server Components
```tsx
// app/dashboard/page.tsx
import { verifyJWT } from '@/src/http/middlewares/verify-jwt';

export default async function DashboardPage() {
  const { user, error } = await verifyJWT();
  if (error) return error;

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
