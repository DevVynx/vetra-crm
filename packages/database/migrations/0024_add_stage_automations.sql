ALTER TABLE "automation_settings" ADD COLUMN "move_on_send_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "automation_settings" ADD COLUMN "move_on_send_stage_id" text;--> statement-breakpoint
ALTER TABLE "automation_settings" ADD COLUMN "move_on_reply_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "automation_settings" ADD COLUMN "move_on_reply_stage_id" text;--> statement-breakpoint
ALTER TABLE "automation_settings" ADD COLUMN "cancel_follow_ups_on_reply" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "automation_settings" ADD COLUMN "archive_unanswered_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "automation_settings" ADD COLUMN "archive_unanswered_stage_id" text;--> statement-breakpoint
ALTER TABLE "automation_settings" ADD COLUMN "archive_unanswered_days" integer DEFAULT 7 NOT NULL;