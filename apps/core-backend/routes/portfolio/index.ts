import express from 'express';
import { registerRoutes } from '../../builder/route';
import createPortfolioRoutes from './portfolio.route';

const portfolioRouter = express.Router();
registerRoutes(portfolioRouter, createPortfolioRoutes());

export default portfolioRouter;