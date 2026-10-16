import type { Request, Response } from "express";
import MarketService from "../services/market.service";
import type { Period } from "../interfaces/market.interface";
import { Logger } from "../utils/logger";

const logger = Logger.here();

class MarketController {

    private marketService = new MarketService();

    searchMarket = async(req: Request, res: Response) => {
        const { query } = req.query

        logger.info("Searching market with query:", query)
        
        const result = await this.marketService.searchMarket(query as string)
        res.json(result)
    }

    getMarketDetails = async(req: Request, res: Response) => {
        const { id } = req.params
        const { period } = req.query

        logger.debug("Getting market details for id:", id)
        logger.info("Period:", period)
        
        const result = await this.marketService.getMarketDetails(id as string, period as Period)
        res.json(result)
    }

    getDefaultsAssets = async(_req: Request, res: Response) => {
        logger.info("New request for getting defaults assets")

        const result = await this.marketService.getDefaultsMarketAssets()
        res.json(result)
    }

}

export default MarketController;