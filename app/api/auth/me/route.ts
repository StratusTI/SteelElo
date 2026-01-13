import { NextResponse } from 'next/server';
import { verifyJWT } from '@/src/http/middlewares/verify-jwt';

export async function GET() {
  const { user, error } = await verifyJWT();

  if (error || !user) {
    return (
      error ||
      NextResponse.json(
        { success: false, message: 'Não autenticado' },
        { status: 401 },
      )
    );
  }

  const nomeCompleto = `${user.nome} ${user.sobrenome}`.trim();

  return NextResponse.json(
    {
      success: true,
      data: {
        id: user.id,
        nome: user.nome,
        sobrenome: user.sobrenome,
        nomeCompleto,
        email: user.email,
        foto: user.foto,
        telefone: user.telefone,
        admin: user.admin,
        superadmin: user.superadmin,
        role: user.role,
        idempresa: user.idempresa,
        departamento: user.departamento,
        time: user.time,
        online: user.online,
      },
    },
    {
      status: 200,
    },
  );
}
