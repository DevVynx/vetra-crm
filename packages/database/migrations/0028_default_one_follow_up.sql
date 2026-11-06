ALTER TABLE "automation_settings" ALTER COLUMN "follow_up_limit" SET DEFAULT 1;
--> statement-breakpoint
UPDATE "automation_settings" SET "follow_up_limit" = 1;
