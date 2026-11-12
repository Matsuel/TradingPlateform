import { beforeEach, expect, test } from "bun:test"
import PortfolioRepository from "../repositories/portfolio.repository"
import { createUser, describeWithDb, resetDatabase } from "./database"

const repo = new PortfolioRepository()

describeWithDb("PortfolioRepository (base de test)", () => {
    let userId: string
    beforeEach(async () => {
        await resetDatabase()
        userId = await createUser()
    })

    test("create, getById, update et delete", async () => {
        const created = await repo.create({ userId, name: "Principal" })
        expect((await repo.getById(created.id))?.name).toBe("Principal")

        const updated = await repo.update(created.id, { name: "Renommé" })
        expect(updated.name).toBe("Renommé")

        await repo.delete(created.id)
        expect(await repo.getById(created.id)).toBeNull()
    })

    test("getAllByUserId isole les utilisateurs et pagine", async () => {
        const other = await createUser("autre@test.dev")
        for (const name of ["a", "b", "c"]) await repo.create({ userId, name })
        await repo.create({ userId: other, name: "x" })

        const page = await repo.getAllByUserId(userId, { page: 2, pageSize: 2 })

        expect(page.count).toBe(3)
        expect(page.data).toHaveLength(1)
    })
})
