CREATE TYPE "public"."queued_follow_up_status" AS ENUM('queued', 'scheduled', 'cancelled');--> statement-breakpoint
CREATE TABLE "queued_follow_ups" (
	"id" text PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"step" integer NOT NULL,
	"body" text NOT NULL,
	"status" "queued_follow_up_status" DEFAULT 'queued' NOT NULL,
	"scheduled_action_id" text,
	"scheduled_by_action_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "automation_settings" ADD COLUMN "follow_up1_wait_days" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "automation_settings" ADD COLUMN "follow_up2_wait_days" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "automation_settings" ADD COLUMN "follow_up3_wait_days" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "queued_follow_ups" ADD CONSTRAINT "queued_follow_ups_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "queued_follow_ups_lead_step_idx" ON "queued_follow_ups" USING btree ("lead_id","step");