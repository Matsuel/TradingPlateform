import express from 'express';
import { registerRoutes } from "@azimut/http";
import createPortfolioRoutes from './portfolio.routes';

const portfolioRouter = express.Router();
registerRoutes(portfolioRouter, createPortfolioRoutes());

export default portfolioRouter;