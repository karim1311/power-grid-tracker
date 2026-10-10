import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "./auth.config";
import { users } from "./lib/db/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email'},
                password: { label: 'Password', type: 'password'},
            },
            async authorize(credentials) {
                const email = 
                  typeof credentials?.email === 'string'
                    ? credentials.email
                    : '';
                
                    const password =
                      typeof credentials?.password === 'string'
                        ? credentials.password
                        : '';

                if (!email || !password) return null;

                const record = await users.findCredentialsByEmail(email);

                if (!record) return null;

                const passwordsMatch = await bcrypt.compare(
                    password,
                    record.passwordHash,
                )

                if (!passwordsMatch) return null;

                return {
                    id: record.user.id,
                    email: record.user.email
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }

            return session;
        },
    },
});