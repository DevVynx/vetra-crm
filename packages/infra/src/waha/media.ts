import { wahaMessageSchema } from "./messages";
import { ensureWahaAccepted, parseWahaResponse, WAHA_SESSION, wahaFetch } from "./wahaFetch";
import { WahaMediaTooLargeError } from "./WahaMediaTooLargeError";
import { WahaMediaUnavailableError } from "./WahaMediaUnavailableError";
import { WahaRequestRejectedError } from "./WahaRequestRejectedError";

const MAX_MEDIA_BYTES = 25 * 1024 * 1024;
const MEDIA_TIMEOUT_MS = 60_000;
const FILES_PATH = "/api/files/";

export type WahaMediaFile = {
  content: Buffer;
  mimetype: string | null;
  filename: string | null;
};

// Only the path of the address WAHA gives is used, on the address Vetra already trusts: whatever
// host the URL names, and whatever it points to besides WAHA's own files, is never requested.
function filePathOf(url: string): string | null {
  try {
    const { pathname } = new URL(url);

    return pathname.startsWith(FILES_PATH) ? pathname : null;
  } catch {
    return null;
  }
}

async function readWithLimit(response: Response): Promise<Buffer> {
  const declared = Number(response.headers.get("content-length"));
  if (declared > MAX_MEDIA_BYTES) throw new WahaMediaTooLargeError();
  if (!response.body) throw new WahaMediaUnavailableError();

  const chunks: Uint8Array[] = [];
  let received = 0;

  for await (const chunk of response.body) {
    received += chunk.length;
    if (received > MAX_MEDIA_BYTES) throw new WahaMediaTooLargeError();
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export async function downloadMessageMedia(
  chatId: string,
  messageId: string
): Promise<WahaMediaFile> {
  const messageResponse = await wahaFetch(
    `/api/${WAHA_SESSION}/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}?downloadMedia=true`,
    "GET",
    undefined,
    MEDIA_TIMEOUT_MS
  );
  if (messageResponse.status === 404) throw new WahaMediaUnavailableError();

  const { media } = await parseWahaResponse(messageResponse, wahaMessageSchema);
  const filePath = media?.url && !media.error ? filePathOf(media.url) : null;
  if (!filePath) throw new WahaMediaUnavailableError();

  const fileResponse = await wahaFetch(filePath, "GET", undefined, MEDIA_TIMEOUT_MS);
  if (fileResponse.status === 404 || fileResponse.status === 410)
    throw new WahaMediaUnavailableError();

  try {
    ensureWahaAccepted(fileResponse);
  } catch (error) {
    if (error instanceof WahaRequestRejectedError) throw new WahaMediaUnavailableError();
    throw error;
  }

  return {
    content: await readWithLimit(fileResponse),
    mimetype: media?.mimetype ?? fileResponse.headers.get("content-type"),
    filename: media?.filename ?? null,
  };
}
