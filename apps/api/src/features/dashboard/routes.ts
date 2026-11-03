import { dashboardRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  getConversionByNicheController,
  getFunnelController,
  getProspectingController,
  getRevenueController,
  getSummaryController,
} from "./controllers";
import v from "./validators";

export const dashboardRouter: Router = Router();

dashboardRouter.get(dashboardRoutes.summary, v.getSummary, getSummaryController);
dashboardRouter.get(dashboardRoutes.revenue, v.getRevenue, getRevenueController);
dashboardRouter.get(dashboardRoutes.funnel, v.getFunnel, getFunnelController);
dashboardRouter.get(dashboardRoutes.prospecting, v.getProspecting, getProspectingController);
dashboardRouter.get(
  dashboardRoutes.conversionByNiche,
  v.getConversionByNiche,
  getConversionByNicheController
);
