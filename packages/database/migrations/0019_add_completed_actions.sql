CREATE TABLE "completed_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"lead_id" text NOT NULL,
	"type" "next_action_type" NOT NULL,
	"follow_up_step" integer,
	"description" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "completed_actions" ADD CONSTRAINT "completed_actions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "completed_actions_lead_id_idx" ON "completed_actions" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "completed_actions_completed_at_idx" ON "completed_actions" USING btree ("completed_at");