import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasSession = !!getSessionCookie(request);
    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (!hasSession && !isAuthPage) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    if (hasSession && isAuthPage) {
        return NextResponse.redirect(new URL("/app", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/app/:path*", "/login", "/register"],
};