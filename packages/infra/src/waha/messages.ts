import { z } from "zod";

import { parseWahaResponse, WAHA_SESSION, wahaFetch } from "./wahaFetch";

// A slow answer here is normal: the overview also resolves profile pictures.
const LONG_REQUEST_TIMEOUT_MS = 30_000;

export const wahaMessageSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  fromMe: z.boolean(),
  ackName: z.string().nullish(),
  from: z.string().nullish(),
  to: z.string().nullish(),
  body: z.string().nullish(),
  hasMedia: z.boolean().nullish(),
  media: z.object({ mimetype: z.string().nullish() }).nullish(),
  replyTo: z.object({ id: z.string().nullish(), body: z.string().nullish() }).nullish(),
  _data: z
    .object({
      Info: z
        .object({
          Chat: z.string().nullish(),
          SenderAlt: z.string().nullish(),
          RecipientAlt: z.string().nullish(),
          PushName: z.string().nullish(),
        })
        .nullish(),
    })
    .nullish(),
});
export type WahaMessage = z.infer<typeof wahaMessageSchema>;

const chatOverviewSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  picture: z.string().nullish(),
  lastMessage: z
    .object({
      id: z.string().nullish(),
      timestamp: z.number(),
      fromMe: z.boolean().nullish(),
      ackName: z.string().nullish(),
    })
    .nullish(),
});
export type WahaChatOverview = z.infer<typeof chatOverviewSchema>;

const contactSchema = z.object({
  id: z.string(),
  number: z.string().nullish(),
  name: z.string().nullish(),
  pushname: z.string().nullish(),
  isMyContact: z.boolean().nullish(),
});
export type WahaContact = z.infer<typeof contactSchema>;

const unknownListSchema = z.array(z.unknown());

// One malformed item must not throw away the whole page of a long history.
function parseItems<Schema extends z.ZodType>(items: unknown[], schema: Schema): z.infer<Schema>[] {
  return items.flatMap((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export async function getChatsOverview(limit: number, offset: number): Promise<WahaChatOverview[]> {
  const response = await wahaFetch(
    `/api/${WAHA_SESSION}/chats/overview?limit=${limit}&offset=${offset}`,
    "GET",
    undefined,
    LONG_REQUEST_TIMEOUT_MS
  );

  return parseItems(await parseWahaResponse(response, unknownListSchema), chatOverviewSchema);
}

export async function getContacts(limit: number, offset: number): Promise<WahaContact[]> {
  const query = new URLSearchParams({
    session: WAHA_SESSION,
    limit: String(limit),
    offset: String(offset),
  });
  const response = await wahaFetch(
    `/api/contacts/all?${query}`,
    "GET",
    undefined,
    LONG_REQUEST_TIMEOUT_MS
  );

  return parseItems(await parseWahaResponse(response, unknownListSchema), contactSchema);
}

type GetChatMessagesInput = {
  chatId: string;
  sinceSeconds: number;
  limit: number;
  offset: number;
};

export async function getChatMessages({
  chatId,
  sinceSeconds,
  limit,
  offset,
}: GetChatMessagesInput): Promise<{ messages: WahaMessage[]; received: number }> {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    downloadMedia: "false",
    "filter.timestamp.gte": String(sinceSeconds),
  });
  const response = await wahaFetch(
    `/api/${WAHA_SESSION}/chats/${encodeURIComponent(chatId)}/messages?${query}`,
    "GET",
    undefined,
    LONG_REQUEST_TIMEOUT_MS
  );
  const items = await parseWahaResponse(response, unknownListSchema);

  return { messages: parseItems(items, wahaMessageSchema), received: items.length };
}

const lidSchema = z.object({ pn: z.string().nullish() });

export async function getPhoneIdOfLid(lid: string): Promise<string | null> {
  const response = await wahaFetch(`/api/${WAHA_SESSION}/lids/${encodeURIComponent(lid)}`);
  if (response.status === 404) return null;

  return (await parseWahaResponse(response, lidSchema)).pn ?? null;
}

const profilePictureSchema = z.object({ profilePictureURL: z.string().nullish() });

export async function getProfilePictureUrl(chatId: string): Promise<string | null> {
  const query = new URLSearchParams({ contactId: chatId, session: WAHA_SESSION });
  const response = await wahaFetch(`/api/contacts/profile-picture?${query}`);

  return (await parseWahaResponse(response, profilePictureSchema)).profilePictureURL ?? null;
}
