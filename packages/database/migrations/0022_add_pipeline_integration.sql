ALTER TABLE "completed_actions" ADD COLUMN "body" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "do_not_contact" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "next_actions" ADD COLUMN "body" text;--> statement-breakpoint
CREATE UNIQUE INDEX "leads_slug_idx" ON "leads" USING btree ("slug");