ALTER TABLE "whatsapp_messages" ADD COLUMN "waha_id" text;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD COLUMN "reply_to_external_id" text;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD COLUMN "reply_to_content" text;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD COLUMN "edited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD COLUMN "deleted_at" timestamp with time zone;