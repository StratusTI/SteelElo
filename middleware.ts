import { authMiddleware } from "./src/infrastructure/http/middlewares/auth-middleware";

export { authMiddleware as middleware };

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
