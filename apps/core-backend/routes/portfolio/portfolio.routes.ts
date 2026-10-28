import PortfolioController from "../../controller/portfolio.controller";
import authMiddleware from "../../middleware/auth.middleware";
import type { RouteDescriptor } from "../../models/route.model";
import asyncHandler from "../../utils/handler";

const createPortfolioRoutes = (): RouteDescriptor[] => {

    const portfolioController = new PortfolioController();

    const prefix = "/api/portfolio"

    return [
        {
            method: "post",
            path: `${prefix}`,
            middlewares: [authMiddleware],
            handler: asyncHandler(portfolioController.createPortfolio)
        },
        {
            method: "get",
            path: `${prefix}`,
            middlewares: [authMiddleware],
            handler: asyncHandler(portfolioController.getAllPortfolios)
        },
        {
            method: "get",
            path: `${prefix}/:id`,
            middlewares: [authMiddleware],
            handler: asyncHandler(portfolioController.getPortfolio)
        },
        {
            method: "patch",
            path: `${prefix}/:id`,
            middlewares: [authMiddleware],
            handler: asyncHandler(portfolioController.updatePortfolio)
        },
        {
            method: "delete",
            path: `${prefix}/:id`,
            middlewares: [authMiddleware],
            handler: asyncHandler(portfolioController.deletePortfolio)
        }
    ];
}

export default createPortfolioRoutes;