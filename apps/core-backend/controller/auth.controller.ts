import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import type { Request, Response } from "express";
import { Logger } from "@trading-plateform/utils";

const logger = Logger.here();

class AuthController {
    auth = async(req: Request, res: Response) => {
        logger.info(`Handling auth request: ${req.method} ${req.originalUrl}`);
        toNodeHandler(auth)(req, res);
    }
}

export default AuthController;