import type { Request, Response } from "express"
import BadRequestError from "../errors/badrequest.error"
import { portfolioSchema } from "../interfaces/portfolio.interface"
import PortfolioService from "../services/portfolio.service"

class PortfolioController {

    private portfolioService = new PortfolioService()

    createPortfolio = async (req: Request, res: Response) => {
        const parsed = portfolioSchema.safeParse(req.body)
        if (!parsed.success) throw new BadRequestError("Name is required")
        const portfolio = await this.portfolioService.create(req.userId!, parsed.data)
        res.status(201).json(portfolio)
    }

    getPortfolio = async (req: Request, res: Response) => {
        const portfolio = await this.portfolioService.getById(req.params.id as string, req.userId!)
        res.json(portfolio)
    }

    getAllPortfolios = async (req: Request, res: Response) => {
        const result = await this.portfolioService.getAll(req.userId!)
        res.json(result)
    }

    updatePortfolio = async (req: Request, res: Response) => {
        const parsed = portfolioSchema.safeParse(req.body)
        if (!parsed.success) throw new BadRequestError("Name is required")
        const portfolio = await this.portfolioService.update(req.params.id as string, req.userId!, parsed.data)
        res.json(portfolio)
    }

    deletePortfolio = async (req: Request, res: Response) => {
        await this.portfolioService.delete(req.params.id as string, req.userId!)
        res.status(204).send()
    }

}

export default PortfolioController;