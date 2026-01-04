import { getAuthUser } from "@/src/interface-adapters/guards/require-auth";

export default async function Home() {
  const user = await getAuthUser()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1>Bem vindo, {user?.nome}!</h1>
      {user?.email && <p>Email: {user.email}</p>}
      {user?.admin && <p>Admin: {user.admin}</p>}
    </div>
  );
}
