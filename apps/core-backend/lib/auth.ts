import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { prisma } from "../prisma";
import { jwt, bearer, admin } from "better-auth/plugins";

export const auth = betterAuth({

    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,

    trustedOrigins: [
        "http://localhost:3000",
    ],

    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
    },

    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        }
    },

    plugins: [
        admin(),
        jwt(),
        bearer(),
    ],
});