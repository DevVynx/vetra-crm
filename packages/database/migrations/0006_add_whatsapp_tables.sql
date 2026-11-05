CREATE TYPE "public"."whatsapp_message_direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."whatsapp_message_type" AS ENUM('text', 'audio', 'image', 'video', 'document', 'other');--> statement-breakpoint
CREATE TABLE "whatsapp_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"connected_at" timestamp with time zone NOT NULL,
	"history_imported_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"phone" text,
	"phone_key" text,
	"lead_id" text,
	"contact_name" text,
	"photo_url" text,
	"photo_fetched_at" timestamp with time zone,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"external_id" text NOT NULL,
	"direction" "whatsapp_message_direction" NOT NULL,
	"type" "whatsapp_message_type" NOT NULL,
	"content" text,
	"sent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_conversation_id_whatsapp_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."whatsapp_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "whatsapp_conversations_chat_id_idx" ON "whatsapp_conversations" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "whatsapp_conversations_phone_key_idx" ON "whatsapp_conversations" USING btree ("phone_key");--> statement-breakpoint
CREATE INDEX "whatsapp_conversations_lead_id_idx" ON "whatsapp_conversations" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "whatsapp_conversations_last_message_at_idx" ON "whatsapp_conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE UNIQUE INDEX "whatsapp_messages_conversation_external_idx" ON "whatsapp_messages" USING btree ("conversation_id","external_id");--> statement-breakpoint
CREATE INDEX "whatsapp_messages_conversation_sent_at_idx" ON "whatsapp_messages" USING btree ("conversation_id","sent_at");--> statement-breakpoint
CREATE INDEX "whatsapp_messages_external_id_idx" ON "whatsapp_messages" USING btree ("external_id");