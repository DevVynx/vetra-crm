import { envConfig } from "@vetra/env/server";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";

import { leadNotesRouter } from "@/features/lead-notes/routes";
import { leadsRouter } from "@/features/leads/routes";
import { nextActionsRouter } from "@/features/next-actions/routes";
import { profileRouter } from "@/features/profile/routes";
import { stagesRouter } from "@/features/stages/routes";
import { handleGlobalError } from "@/shared/middlewares/handleGlobalError";
import { notFoundHandler } from "@/shared/middlewares/notFoundHandler";

export const app: Express = express();

const { FRONTEND_URL } = envConfig.get();

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

app.use("/api", leadNotesRouter);
app.use("/api", leadsRouter);
app.use("/api", nextActionsRouter);
app.use("/api", profileRouter);
app.use("/api", stagesRouter);

app.use(notFoundHandler);
app.use(handleGlobalError);
