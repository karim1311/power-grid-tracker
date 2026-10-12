import type { NextAuthConfig } from "next-auth";

const protectedRoutes = ['/dashboard', 'outages', '/profile'];

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            const isProtected = protectedRoutes.some(
                (route) =>
                    pathname === route || pathname.startsWith(`${route}/`),
            );

            if (isProtected && !isLoggedIn) {
                return false;
            }

            if (
                isLoggedIn &&
                (pathname === '/login' || pathname === '/signup')
            ) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            return true;
        },
    },
} satisfies NextAuthConfig;