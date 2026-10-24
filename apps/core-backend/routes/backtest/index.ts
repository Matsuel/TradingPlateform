import express from "express";
import { registerRoutes } from "../../builder/route";
import createBacktestRoutes from "./backtest.routes";

const backtestRouter = express.Router();

registerRoutes(backtestRouter, createBacktestRoutes());

export default backtestRouter;