import type { Request, Response } from "express"
import PortfolioService from "../services/portfolio.service"

class PortfolioController {

    private portfolioService = new PortfolioService()

    createPortfolio = async (req: Request, res: Response) => {
        const { name } = req.body
        const portfolio = await this.portfolioService.create(req.userId!, name)
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
        const { name } = req.body
        const portfolio = await this.portfolioService.update(req.params.id as string, req.userId!, { name })
        res.json(portfolio)
    }

    deletePortfolio = async (req: Request, res: Response) => {
        await this.portfolioService.delete(req.params.id as string, req.userId!)
        res.status(204).send()
    }

}

export default PortfolioController;