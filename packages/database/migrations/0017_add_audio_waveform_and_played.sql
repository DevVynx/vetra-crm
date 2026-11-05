ALTER TABLE "whatsapp_messages" ADD COLUMN "media_waveform" text;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD COLUMN "is_played" boolean DEFAULT false NOT NULL;