import authMiddleware from "../../middleware/auth.middleware";
import type { RouteDescriptor } from "../../models/route.model";
import proxyTo from "../../utils/proxy";
import { env } from "../../env";

const createMarketRoutes = (): RouteDescriptor[] => {

    const prefix = "/api/market";

    return [
        {
            method: "all",
            path: `${prefix}/{*path}`,
            middlewares: [authMiddleware],
            handler: proxyTo(env.MARKET_SERVICE_URL)
        },
    ];
}

export default createMarketRoutes;
