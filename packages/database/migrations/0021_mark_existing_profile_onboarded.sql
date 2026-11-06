-- The introduction is for whoever installs Vetra. A profile that already exists belongs to someone who
-- has been using it, so it counts as done. On a new database there is no profile yet at this point.
UPDATE "profile" SET "onboarded_at" = now() WHERE "onboarded_at" IS NULL;
