ALTER TABLE "leads" ALTER COLUMN "phone_key" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "leads_phone_key_idx" ON "leads" USING btree ("phone_key");