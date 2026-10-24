import type { Request, Response } from "express"
import BacktestService from "../services/backtest.service"

class BacktestController {

    private backtestService = new BacktestService()

    getBacktest = async (req: Request, res: Response) => {
        const result = await this.backtestService.getById(req.params.id as string, req.userId!)
        res.json(result)
    }

    getAllBacktest = async (req: Request, res: Response) => {
        const result = await this.backtestService.getAll(req.userId!)
        res.json(result)
    }

}

export default BacktestController