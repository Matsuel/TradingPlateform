import type { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { Logger } from '@trading-plateform/utils'
import { auth } from '../lib/auth'
import UnauthorizedError from '../errors/unauthorized.error'

const logger = Logger.here()

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        })

        if (!session?.user) return next(new UnauthorizedError())

        req.userId = session.user.id
        next()
    } catch (error) {
        logger.error('Authentication error', { error: error instanceof Error ? error.message : String(error) })
        next(new UnauthorizedError())
    }
}

export default authMiddleware