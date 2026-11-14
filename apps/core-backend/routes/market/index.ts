import express from "express";
import { registerRoutes } from "@azimut/http";
import createMarketRoutes from "./market.routes";

const marketRouter = express.Router();

registerRoutes(marketRouter, createMarketRoutes());

export default marketRouter;
