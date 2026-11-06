import path from "node:path";

import { envConfig } from "@vetra/env/server";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";

import { customersRouter } from "@/features/customers/routes";
import { dashboardRouter } from "@/features/dashboard/routes";
import { dataTransferRouter } from "@/features/data-transfer/routes";
import { leadNotesRouter } from "@/features/lead-notes/routes";
import { leadsRouter } from "@/features/leads/routes";
import { ledgerRouter } from "@/features/ledger/routes";
import { nextActionsRouter } from "@/features/next-actions/routes";
import { profileRouter } from "@/features/profile/routes";
import { projectsRouter } from "@/features/projects/routes";
import { searchRouter } from "@/features/search/routes";
import { stagesRouter } from "@/features/stages/routes";
import { whatsappRouter } from "@/features/whatsapp/routes";
import { handleGlobalError } from "@/shared/middlewares/handleGlobalError";
import { notFoundHandler } from "@/shared/middlewares/notFoundHandler";
import { rejectForeignHost } from "@/shared/middlewares/rejectForeignHost";
import { rejectForeignOrigin } from "@/shared/middlewares/rejectForeignOrigin";

export const app: Express = express();

const { FRONTEND_URL, WEB_DIST_DIR } = envConfig.get();

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
app.use("/api", dataTransferRouter);
app.use("/api", leadNotesRouter);
app.use("/api", leadsRouter);
app.use("/api", ledgerRouter);
app.use("/api", nextActionsRouter);
app.use("/api", profileRouter);
app.use("/api", projectsRouter);
app.use("/api", searchRouter);
app.use("/api", stagesRouter);
app.use("/api", whatsappRouter);

// The built web, when there is one. Every address that is not the API gives the page, which is
// what a single-page app needs for a screen opened by its own address. The files have a hash in
// their name, so they can be kept; the page itself cannot, or an update would not show.
if (WEB_DIST_DIR) {
  const indexFile = path.resolve(WEB_DIST_DIR, "index.html");

  app.use(
    express.static(WEB_DIST_DIR, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );
  app.use((req, res, next) => {
    // A screen has no extension. A file that is asked for and doesn't exist (an asset of an older
    // version of the page) is a 404, not the page, which a script would choke on.
    const isPage =
      (req.method === "GET" || req.method === "HEAD") &&
      !req.path.startsWith("/api") &&
      path.extname(req.path) === "";
    if (!isPage) return next();

    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(indexFile);
  });
}

app.use(notFoundHandler);
app.use(handleGlobalError);
