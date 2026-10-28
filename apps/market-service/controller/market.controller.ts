import type { Request, Response } from "express";
import MarketService from "../services/market.service";
import type { Period } from "../interfaces/market.interface";
import { Logger } from "@trading-plateform/utils";

const logger = Logger.here();

class MarketController {

    private marketService = new MarketService();

    searchMarket = async(req: Request, res: Response) => {
        const { query } = req.query

        logger.info(`Handling search market request ${req.method} ${req.originalUrl}`)
        
        const result = await this.marketService.searchMarket(query as string)
        res.json(result)
    }

    getMarketDetails = async(req: Request, res: Response) => {
        const { id } = req.params
        const { period } = req.query

        logger.info(`Handling market details request ${req.method} ${req.originalUrl} ${id} for period ${period}`)
        
        const result = await this.marketService.getMarketDetails(id as string, period as Period)
        res.json(result)
    }

    getDefaultsAssets = async(req: Request, res: Response) => {
        logger.info(`Handling defaults market request ${req.method} ${req.originalUrl}`)

        const result = await this.marketService.getDefaultsMarketAssets()
        res.json(result)
    }

}

export default MarketController;