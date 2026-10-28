import BacktestController from "../../controller/backtest.controller";
import authMiddleware from "../../middleware/auth.middleware";
import type { RouteDescriptor } from "../../models/route.model";
import asyncHandler from "../../utils/handler";

const createBacktestRoutes = (): RouteDescriptor[] => {
    const controller = new BacktestController();

    const prefix = "/api/backtest";

    return [
        {
            method: "post",
            path: `${prefix}`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.createBacktest)
        },
        {
            method: "post",
            path: `${prefix}/:id/executions`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.rerunBacktest)
        },
        {
            method: "get",
            path: `${prefix}/stats`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.getBacktestStats)
        },
        {
            method: "get",
            path: `${prefix}/:id`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.getBacktest)
        },
        {
            method: "get",
            path: `${prefix}`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.getAllBacktests)
        }
    ]
}

export default createBacktestRoutes