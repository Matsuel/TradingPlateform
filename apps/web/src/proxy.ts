import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"
import { routes } from "@/lib/routes"

/**
 * Redirection optimiste sur le seul cookie de session : sans cookie, une page de l'app renvoie vers la connexion avec
 * `redirect` = page demandée. La session réelle est vérifiée côté serveur (`requireSession`, layouts `app/` et `(auth)`) :
 * un cookie expiré ne doit pas renvoyer de `/login` vers `/app`, sinon les deux redirections bouclent.
 */
export function proxy(request: NextRequest) {
    if (getSessionCookie(request)) return NextResponse.next()

    const { pathname, search } = request.nextUrl
    const url = new URL(routes.login, request.url)
    url.searchParams.set("redirect", pathname + search)
    return NextResponse.redirect(url)
}

// Littéral : Next lit le matcher à la compilation, il ne peut pas venir de `routes`
export const config = {
    matcher: ["/app/:path*"],
}
