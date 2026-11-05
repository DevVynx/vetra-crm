-- Same rule as canonicalPhoneOf in packages/core. Existing messages also count as last contact.
UPDATE "leads"
SET "phone_key" = regexp_replace(regexp_replace("phone", '\D', '', 'g'), '^55(\d{2})9(\d{8})$', '55\1\2');
--> statement-breakpoint
UPDATE "leads" AS l
SET "last_contact_at" = greatest(l."last_contact_at", c."last_message_at")
FROM "whatsapp_conversations" AS c
WHERE c."phone_key" = l."phone_key" AND c."last_message_at" IS NOT NULL;
