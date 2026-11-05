CREATE TYPE "public"."whatsapp_message_status" AS ENUM('sent', 'delivered', 'read');--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD COLUMN "status" "whatsapp_message_status";