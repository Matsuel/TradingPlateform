import type { RouteDescriptor } from "../../models/route.model";
import AuthController from "../../controller/auth.controller";

const createAuthRoutes = (): RouteDescriptor[] => {

    const authController = new AuthController();

    return [
        {
            method: "all",
            path: "/api/auth/{*path}",
            handler: authController.auth
        }
    ]
}

export default createAuthRoutes;