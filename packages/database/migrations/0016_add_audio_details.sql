ALTER TABLE "whatsapp_accounts" ADD COLUMN "audio_details_filled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD COLUMN "media_seconds" integer;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD COLUMN "is_voice" boolean DEFAULT false NOT NULL;