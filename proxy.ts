import { authMiddleware } from "./src/infrastructure/http/middlewares/auth-middleware";

export default authMiddleware;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
