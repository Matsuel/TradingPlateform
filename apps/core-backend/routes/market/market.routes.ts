import authMiddleware from "../../middleware/auth.middleware";
import type { RouteDescriptor } from "@azimut/http";
import proxyTo from "../../utils/proxy";
import { env } from "../../env";

const createMarketRoutes = (): RouteDescriptor[] => {

    const prefix = "/api/market";

    // Liste blanche : seules les routes lues par le web sont relayées. `closes` (cours d'un backtest, jusqu'à 50 symboles,
    // sans cache) reste réservée à backtest-engine, qui appelle market-service directement.
    return ["search", "details/:id", "defaults"].map((path): RouteDescriptor => ({
        method: "get",
        path: `${prefix}/${path}`,
        middlewares: [authMiddleware],
        handler: proxyTo(env.MARKET_SERVICE_URL),
    }));
}

export default createMarketRoutes;
