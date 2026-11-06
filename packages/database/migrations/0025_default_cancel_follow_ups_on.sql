ALTER TABLE "automation_settings" ALTER COLUMN "cancel_follow_ups_on_reply" SET DEFAULT true;
--> statement-breakpoint
UPDATE "automation_settings" SET "cancel_follow_ups_on_reply" = true;
