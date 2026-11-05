DROP INDEX "whatsapp_conversations_phone_key_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "whatsapp_conversations_phone_key_idx" ON "whatsapp_conversations" USING btree ("phone_key");