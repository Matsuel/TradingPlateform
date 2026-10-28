import type { NextFunction, Request, Response } from "express";

const asyncHandler =
    (fn: (req: Request, res: Response) => Promise<void>) =>
        (req: Request, res: Response, next: NextFunction) =>
            fn(req, res).catch(next);

export default asyncHandler;