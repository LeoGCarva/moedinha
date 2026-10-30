import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/login" });

export const config = {
  // Só páginas protegidas; login, cadastro, /api/auth e assets ficam livres.
  matcher: ["/", "/perfil"],
};
