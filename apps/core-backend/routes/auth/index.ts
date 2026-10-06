import express from 'express';
import { registerRoutes } from '../../builder/route';
import createAuthRoutes from './auth.routes';

const authRouter = express.Router();
registerRoutes(authRouter, createAuthRoutes());

export default authRouter;