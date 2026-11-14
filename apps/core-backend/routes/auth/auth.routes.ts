import type { RouteDescriptor } from "@azimut/http";
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