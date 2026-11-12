import { expect, test } from "bun:test"
import type { MarketAsset } from "@trading-plateform/contracts"
import { DEFAULT_TICKERS } from "../constants/market.constants"
import type { IMarketRepository } from "../repositories/market.repository"
import MarketService from "../services/market.service"

test("la liste par défaut n'interroge le fournisseur que pour les symboles de la page", async () => {
    const asked: string[][] = []
    const service = new MarketService()
    service.repo = {
        getAssets: async (symbols: string[]) => {
            asked.push(symbols)
            return symbols.map((symbol) => ({ symbol }) as MarketAsset)
        },
    } as unknown as IMarketRepository

    const page = await service.getDefaultsMarketAssets({ page: 2, pageSize: 3 })

    expect(asked).toEqual([DEFAULT_TICKERS.slice(3, 6)])
    expect(page).toMatchObject({ count: DEFAULT_TICKERS.length, page: 2, pageSize: 3 })
    expect(page.data).toHaveLength(3)
})
