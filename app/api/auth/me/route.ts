import { verifyJWT } from '@/src/http/middlewares/verify-jwt';
import { successResponse } from '@/src/utils/http-response';

export async function GET() {
  const { user, error } = await verifyJWT();

  if (error || !user) {
    return error;
  }

  const nomeCompleto = `${user.nome} ${user.sobrenome}`.trim();

  return successResponse(
    {
      id: user.id,
      nome: user.nome,
      sobrenome: user.sobrenome,
      nomeCompleto,
      email: user.email,
      foto: user.foto,
      telefone: user.telefone,
      admin: user.admin,
      superadmin: user.superadmin,
      idempresa: user.idempresa,
      departamento: user.departamento,
      time: user.time,
      online: user.online,
    },
    200,
    'User data retrieved successfully',
  );
}
