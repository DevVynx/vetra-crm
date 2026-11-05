-- Audio gained its waveform and its listened mark, so the one-time fill of old audio runs again.
UPDATE "whatsapp_accounts" SET "audio_details_filled_at" = NULL;
