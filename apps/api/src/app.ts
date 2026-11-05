import { envConfig } from "@vetra/env/server";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";

import { customersRouter } from "@/features/customers/routes";
import { dashboardRouter } from "@/features/dashboard/routes";
import { leadNotesRouter } from "@/features/lead-notes/routes";
import { leadsRouter } from "@/features/leads/routes";
import { ledgerRouter } from "@/features/ledger/routes";
import { nextActionsRouter } from "@/features/next-actions/routes";
import { profileRouter } from "@/features/profile/routes";
import { projectsRouter } from "@/features/projects/routes";
import { searchRouter } from "@/features/search/routes";
import { stagesRouter } from "@/features/stages/routes";
import { handleGlobalError } from "@/shared/middlewares/handleGlobalError";
import { notFoundHandler } from "@/shared/middlewares/notFoundHandler";
import { rejectForeignHost } from "@/shared/middlewares/rejectForeignHost";
import { rejectForeignOrigin } from "@/shared/middlewares/rejectForeignOrigin";

export const app: Express = express();

const { FRONTEND_URL } = envConfig.get();

app.use(rejectForeignHost);
app.use(rejectForeignOrigin);

app.use(express.json());

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use("/api", customersRouter);
app.use("/api", dashboardRouter);
app.use("/api", leadNotesRouter);
app.use("/api", leadsRouter);
app.use("/api", ledgerRouter);
app.use("/api", nextActionsRouter);
app.use("/api", profileRouter);
app.use("/api", projectsRouter);
app.use("/api", searchRouter);
app.use("/api", stagesRouter);

app.use(notFoundHandler);
app.use(handleGlobalError);
