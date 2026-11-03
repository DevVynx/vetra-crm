CREATE TYPE "public"."next_action_type" AS ENUM('first_approach', 'follow_up', 'meeting', 'proposal', 'custom');--> statement-breakpoint
CREATE TABLE "next_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"type" "next_action_type" NOT NULL,
	"follow_up_step" integer,
	"description" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "next_actions" ADD CONSTRAINT "next_actions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "next_actions_lead_id_idx" ON "next_actions" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "next_actions_due_at_idx" ON "next_actions" USING btree ("due_at");