import MarketController from "../../controller/market.controller";
import type { RouteDescriptor } from "../../models/route.model";
import asyncHandler from "../../utils/handler";

const createMarketRoutes = (): RouteDescriptor[] => {

    const controller = new MarketController();

    const prefix = "/api/market";

    return [
        {
            method: "get",
            path: `${prefix}/search`,
            // middlewares: [authMiddleware],
            handler: asyncHandler(controller.searchMarket)
        },
        {
            method: "get",
            path: `${prefix}/details/:id`,
            handler: asyncHandler(controller.getMarketDetails)
        }
    ];
}

export default createMarketRoutes;