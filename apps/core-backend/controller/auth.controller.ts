import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth";
import type { Request, Response } from "express";
import { Logger } from "../utils/logger";

const logger = Logger.here();

class AuthController {
    auth = async(req: Request, res: Response) => {
        logger.info(`Handling auth request: ${req.method} ${req.originalUrl}`);
        toNodeHandler(auth)(req, res);
    }
}

export default AuthController;