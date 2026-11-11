-- Vetra's own sent messages used to come back from WhatsApp under a hidden id and open a second conversation, with no
-- number, beside the one with the phone. Only a conversation with no phone whose every message is already in a
-- conversation with a phone is removed: a contact known only by its hidden id keeps what is unique to it.
DELETE FROM "whatsapp_conversations" c
WHERE c."phone" IS NULL
  AND c."chat_id" LIKE '%@lid'
  AND EXISTS (SELECT 1 FROM "whatsapp_messages" m WHERE m."conversation_id" = c."id")
  AND NOT EXISTS (
    SELECT 1 FROM "whatsapp_messages" m
    WHERE m."conversation_id" = c."id"
      AND NOT EXISTS (
        SELECT 1 FROM "whatsapp_messages" o
        JOIN "whatsapp_conversations" oc ON oc."id" = o."conversation_id"
        WHERE o."external_id" = m."external_id"
          AND o."conversation_id" <> c."id"
          AND oc."phone" IS NOT NULL
      )
  );
