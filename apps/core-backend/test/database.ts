import { describe } from "bun:test"
import { prisma } from "../prisma"

/** `describe` des tests de repositories : ignoré si la base de test n'a pas pu être préparée (voir `setup.ts`). */
export const describeWithDb = describe.skipIf(process.env.TEST_DB_READY !== "1")

/** Vide la base de test : supprimer les utilisateurs emporte leurs portefeuilles et backtests (`onDelete: Cascade`). */
export const resetDatabase = () => prisma.user.deleteMany()

/** Crée un utilisateur de test et renvoie son id. */
export async function createUser(email = "u1@test.dev") {
    const user = await prisma.user.create({ data: { name: "Test", email } })
    return user.id
}
