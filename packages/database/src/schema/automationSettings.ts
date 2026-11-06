import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

import { updatedAtColumn } from "./common";

// One row, with a fixed id: the settings of the automations. Without the row, the defaults apply.
export const automationSettingsTable = pgTable("automation_settings", {
  id: text().primaryKey(),
  // The master switch: nothing is sent by itself while it is off.
  autoSendEnabled: boolean().notNull().default(false),
  autoSendDelayMinutes: integer().notNull().default(2),
  // Whether a lead that comes in (typed, imported or from the pipeline) starts with its own switch on.
  newLeadsAutoSend: boolean().notNull().default(false),
  // Each reaction to the conversation has its own switch. The stage ids are not foreign keys: a stage the
  // user deleted just leaves the automation without a target, and it waits for a new choice.
  moveOnSendEnabled: boolean().notNull().default(false),
  moveOnSendStageId: text(),
  moveOnReplyEnabled: boolean().notNull().default(false),
  moveOnReplyStageId: text(),
  cancelFollowUpsOnReply: boolean().notNull().default(true),
  archiveUnansweredEnabled: boolean().notNull().default(false),
  archiveUnansweredStageId: text(),
  archiveUnansweredDays: integer().notNull().default(7),
  // How many of the follow-up texts the pipeline hands over Vetra keeps (0 to 3), and the days to wait before each, counted
  // from the send of the message before it. The pipeline only gives the texts, in order: the rest is Vetra's.
  followUpLimit: integer().notNull().default(1),
  followUp1WaitDays: integer().notNull().default(2),
  followUp2WaitDays: integer().notNull().default(3),
  followUp3WaitDays: integer().notNull().default(5),
  updatedAt: updatedAtColumn(),
});
