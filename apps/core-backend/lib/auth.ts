import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { prisma } from "../prisma";
import { jwt, bearer, admin } from "better-auth/plugins";
import { env } from "../env";

export const auth = betterAuth({

    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,

    trustedOrigins: [
        env.WEB_URL,
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