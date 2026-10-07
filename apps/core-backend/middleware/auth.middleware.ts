import type { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../lib/auth'
import AppError from '../models/error.model'

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        })

        if (!session?.user) return next(new AppError('Unauthorized', 401))

        req.userId = session.user.id
        next()
    } catch (error) {
        console.error('Authentication error:', error)
        next(new AppError('Unauthorized', 401))
    }
}

export default authMiddleware