import express from 'express';
import { registerRoutes } from "@trading-plateform/http";
import createAuthRoutes from './auth.routes';

const authRouter = express.Router();
registerRoutes(authRouter, createAuthRoutes());

export default authRouter;