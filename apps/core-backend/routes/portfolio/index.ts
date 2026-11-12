import express from 'express';
import { registerRoutes } from "@trading-plateform/http";
import createPortfolioRoutes from './portfolio.routes';

const portfolioRouter = express.Router();
registerRoutes(portfolioRouter, createPortfolioRoutes());

export default portfolioRouter;