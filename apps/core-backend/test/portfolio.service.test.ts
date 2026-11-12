import { expect, test } from "bun:test"
import PortfolioService from "../services/portfolio.service"
import type { IPortfolioRepository } from "../repositories/portfolio.repository"

const portfolioOf = (userId: string) => ({ id: "p1", userId, name: "Principal" }) as never

function serviceWith(getById: IPortfolioRepository["getById"]) {
    const service = new PortfolioService()
    service.repo = { getById } as unknown as IPortfolioRepository
    return service
}

test("un portefeuille est lisible par son propriétaire", async () => {
    const service = serviceWith(async () => portfolioOf("u1"))

    expect(await service.getById("p1", "u1")).toMatchObject({ id: "p1" })
})

test("le portefeuille d'un autre est refusé (403 ACCESS_DENIED)", async () => {
    const service = serviceWith(async () => portfolioOf("autre"))

    expect(await service.getById("p1", "u1").catch((e) => e)).toMatchObject({ code: "ACCESS_DENIED", statusCode: 403 })
})

test("un portefeuille inconnu est introuvable (404 PORTFOLIO_NOT_FOUND)", async () => {
    const service = serviceWith(async () => null)

    expect(await service.getById("p1", "u1").catch((e) => e)).toMatchObject({ code: "PORTFOLIO_NOT_FOUND", statusCode: 404 })
})
