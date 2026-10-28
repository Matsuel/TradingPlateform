import type { Request, Response } from "express"
import BadRequestError from "../errors/badrequest.error"
import { createBacktestSchema } from "../interfaces/backtest.interface"
import BacktestService from "../services/backtest.service"

class BacktestController {

    private backtestService = new BacktestService()

    createBacktest = async (req: Request, res: Response) => {
        const parsed = createBacktestSchema.safeParse(req.body)
        if (!parsed.success) throw new BadRequestError("Invalid backtest", { issues: parsed.error.issues })
        const backtest = await this.backtestService.create(req.userId!, parsed.data)
        res.status(202).json(backtest)
    }

    getBacktest = async (req: Request, res: Response) => {
        const result = await this.backtestService.getById(req.params.id as string, req.userId!)
        res.json(result)
    }

    rerunBacktest = async (req: Request, res: Response) => {
        const execution = await this.backtestService.rerun(req.params.id as string, req.userId!)
        res.status(202).json(execution)
    }

    getAllBacktests = async (req: Request, res: Response) => {
        const result = await this.backtestService.getAll(req.userId!)
        res.json(result)
    }

}

export default BacktestController