CREATE TYPE "public"."stage_role" AS ENUM('entry', 'middle', 'closing', 'archive');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"business_name" text NOT NULL,
	"contact_name" text,
	"niche" text NOT NULL,
	"city" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"demo_url" text,
	"stage_id" text NOT NULL,
	"stopped_at_stage_id" text,
	"stage_changed_at" timestamp with time zone NOT NULL,
	"prospected_at" timestamp with time zone NOT NULL,
	"last_contact_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"role" "stage_role" NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_stopped_at_stage_id_stages_id_fk" FOREIGN KEY ("stopped_at_stage_id") REFERENCES "public"."stages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leads_stage_id_idx" ON "leads" USING btree ("stage_id");--> statement-breakpoint
CREATE INDEX "leads_stopped_at_stage_id_idx" ON "leads" USING btree ("stopped_at_stage_id");--> statement-breakpoint
CREATE INDEX "leads_niche_idx" ON "leads" USING btree ("niche");--> statement-breakpoint
CREATE INDEX "leads_city_idx" ON "leads" USING btree ("city");--> statement-breakpoint
CREATE INDEX "leads_prospected_at_idx" ON "leads" USING btree ("prospected_at");