import express from "express";
import { registerRoutes } from "../../builder/route";
import createMarketRoutes from "./market.route";

const marketRouter = express.Router();

registerRoutes(marketRouter, createMarketRoutes());

export default marketRouter;