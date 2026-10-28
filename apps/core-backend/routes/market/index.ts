import express from "express";
import { registerRoutes } from "../../builder/route";
import createMarketRoutes from "./market.routes";

const marketRouter = express.Router();

registerRoutes(marketRouter, createMarketRoutes());

export default marketRouter;
