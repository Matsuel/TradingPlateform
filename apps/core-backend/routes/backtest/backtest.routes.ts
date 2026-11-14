import BacktestController from "../../controller/backtest.controller";
import authMiddleware from "../../middleware/auth.middleware";
import type { RouteDescriptor } from "@azimut/http";
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
            path: `${prefix}/batch`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.createBatch)
        },
        {
            method: "get",
            path: `${prefix}/batch/:batchId`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.getBatch)
        },
        {
            method: "post",
            path: `${prefix}/batch/:batchId/starts`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.restartBatch)
        },
        {
            method: "post",
            path: `${prefix}/batch/:batchId/executions`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.rerunBatch)
        },
        {
            method: "post",
            path: `${prefix}/preview`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.previewBacktest)
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
            path: `${prefix}/compare`,
            middlewares: [authMiddleware],
            handler: asyncHandler(controller.compareBacktests)
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