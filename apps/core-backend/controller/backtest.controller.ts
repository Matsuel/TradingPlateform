import type { Request, Response } from "express"
import BadRequestError from "../errors/badrequest.error"
import { backtestCompareQuerySchema, backtestListQuerySchema, createBacktestSchema } from "../interfaces/backtest.interface"
import BacktestService from "../services/backtest.service"

class BacktestController {

    private backtestService = new BacktestService()

    createBacktest = async (req: Request, res: Response) => {
        const parsed = createBacktestSchema.safeParse(req.body)
        if (!parsed.success) throw new BadRequestError("Invalid backtest", { issues: parsed.error.issues })
        const backtest = await this.backtestService.create(req.userId!, parsed.data)
        res.status(202).json(backtest)
    }

    previewBacktest = async (req: Request, res: Response) => {
        const parsed = createBacktestSchema.safeParse(req.body)
        if (!parsed.success) throw new BadRequestError("Invalid backtest", { issues: parsed.error.issues })
        res.json(this.backtestService.preview(req.userId!, parsed.data))
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
        const parsed = backtestListQuerySchema.safeParse(req.query)
        if (!parsed.success) throw new BadRequestError("Invalid query", { issues: parsed.error.issues })
        const result = await this.backtestService.getAll(req.userId!, parsed.data)
        res.json(result)
    }

    compareBacktests = async (req: Request, res: Response) => {
        const parsed = backtestCompareQuerySchema.safeParse(req.query)
        if (!parsed.success) throw new BadRequestError("Invalid query", { issues: parsed.error.issues })
        const comparison = await this.backtestService.compare(req.userId!, parsed.data)
        res.json(comparison)
    }

    getBacktestStats =async (req: Request, res: Response) => {
        const stats = await this.backtestService.getStats(req.userId!)
        res.json(stats)
    }

}

export default BacktestController