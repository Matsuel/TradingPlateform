import type { Request, Response } from "express";
import MarketService from "../services/market.service";
import BadRequestError from "../errors/badrequest.error";
import { periodSchema } from "@trading-plateform/contracts";
import { marketIdSchema, searchMarketSchema } from "../interfaces/market.interface";
import { paginationQuerySchema } from "@trading-plateform/contracts";
import { Logger } from "@trading-plateform/utils";

const logger = Logger.here();

class MarketController {

    private marketService = new MarketService();

    searchMarket = async(req: Request, res: Response) => {
        logger.info(`Handling search market request ${req.method} ${req.originalUrl}`)

        const parsed = searchMarketSchema.safeParse(req.query)
        if (!parsed.success) throw new BadRequestError("Query must be at least 2 characters")

        const result = await this.marketService.searchMarket(parsed.data.query)
        res.json(result)
    }

    getMarketDetails = async(req: Request, res: Response) => {
        const { id } = req.params
        const { period } = req.query

        logger.info(`Handling market details request ${req.method} ${req.originalUrl} ${id} for period ${period}`)

        const parsedId = marketIdSchema.safeParse(id)
        if (!parsedId.success) throw new BadRequestError("Id must be provided")
        const parsedPeriod = periodSchema.safeParse(period)
        if (!parsedPeriod.success) throw new BadRequestError("Invalid period", { issues: parsedPeriod.error.issues })

        const result = await this.marketService.getMarketDetails(parsedId.data, parsedPeriod.data)
        res.json(result)
    }

    getDefaultsAssets = async(req: Request, res: Response) => {
        logger.info(`Handling defaults market request ${req.method} ${req.originalUrl}`)

        const parsed = paginationQuerySchema.safeParse(req.query)
        if (!parsed.success) throw new BadRequestError("Invalid pagination", { issues: parsed.error.issues })

        const result = await this.marketService.getDefaultsMarketAssets(parsed.data)
        res.json(result)
    }

}

export default MarketController;
