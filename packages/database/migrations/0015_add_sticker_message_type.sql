ALTER TYPE "public"."whatsapp_message_type" ADD VALUE 'sticker' BEFORE 'other';--> statement-breakpoint
ALTER TABLE "whatsapp_accounts" ADD COLUMN "stickers_repaired_at" timestamp with time zone;