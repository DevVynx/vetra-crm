ALTER TABLE "whatsapp_conversations" DROP CONSTRAINT "whatsapp_conversations_lead_id_leads_id_fk";
--> statement-breakpoint
DROP INDEX "whatsapp_conversations_lead_id_idx";--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "phone_key" text;--> statement-breakpoint
ALTER TABLE "whatsapp_conversations" DROP COLUMN "lead_id";