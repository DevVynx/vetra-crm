CREATE TABLE "automation_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"auto_send_enabled" boolean DEFAULT false NOT NULL,
	"auto_send_delay_minutes" integer DEFAULT 2 NOT NULL,
	"new_leads_auto_send" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "completed_actions" ADD COLUMN "sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "auto_send" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "next_actions" ADD COLUMN "send_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "next_actions" ADD COLUMN "send_error" text;--> statement-breakpoint
ALTER TABLE "next_actions" ADD COLUMN "send_blocks_done" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "next_actions" ADD COLUMN "sending_since" timestamp with time zone;