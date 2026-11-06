import { crc32, inflateRawSync } from "node:zlib";

export type ZipFileEntry = { name: string; content: Buffer };

export type ZipLimits = { maxEntries: number; maxEntryBytes: number; maxTotalBytes: number };

export type ZipReadProblem =
  "not-a-zip" | "unsupported" | "too-many-files" | "too-large" | "corrupt";

export class ZipReadError extends Error {
  constructor(readonly problem: ZipReadProblem) {
    super(`The zip can't be read: ${problem}`);
  }
}

const LOCAL_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_HEADER_SIGNATURE = 0x02014b50;
const END_SIGNATURE = 0x06054b50;
const END_SIZE = 22;
const LOCAL_HEADER_SIZE = 30;
const CENTRAL_HEADER_SIZE = 46;
const MAX_COMMENT_BYTES = 0xffff;
const ENCRYPTED_FLAG = 0x0001;
const STORED = 0;
const DEFLATED = 8;
const ZIP64_MARKER = 0xffffffff;

function findEnd(zip: Buffer): number {
  const lowest = Math.max(0, zip.length - END_SIZE - MAX_COMMENT_BYTES);

  for (let at = zip.length - END_SIZE; at >= lowest; at--) {
    if (zip.readUInt32LE(at) === END_SIGNATURE) return at;
  }
  throw new ZipReadError("not-a-zip");
}

// Reads a zip written by anything (Windows, macOS, a library). It trusts nothing in it: the sizes
// are checked before a file is opened, the opened size is capped, and every checksum is verified.
// Only stored and deflated files are supported, and no encryption or Zip64.
export function readZip(zip: Buffer, limits: ZipLimits): ZipFileEntry[] {
  if (zip.length < END_SIZE) throw new ZipReadError("not-a-zip");

  const end = findEnd(zip);
  const count = zip.readUInt16LE(end + 10);
  const centralSize = zip.readUInt32LE(end + 12);
  let cursor = zip.readUInt32LE(end + 16);

  if (count === 0xffff || centralSize === ZIP64_MARKER || cursor === ZIP64_MARKER) {
    throw new ZipReadError("unsupported");
  }
  if (count > limits.maxEntries) throw new ZipReadError("too-many-files");

  const entries: ZipFileEntry[] = [];
  let totalBytes = 0;

  for (let index = 0; index < count; index++) {
    if (cursor + CENTRAL_HEADER_SIZE > zip.length) throw new ZipReadError("corrupt");
    if (zip.readUInt32LE(cursor) !== CENTRAL_HEADER_SIGNATURE) throw new ZipReadError("corrupt");

    const flags = zip.readUInt16LE(cursor + 8);
    const method = zip.readUInt16LE(cursor + 10);
    const expectedCrc = zip.readUInt32LE(cursor + 16);
    const compressedSize = zip.readUInt32LE(cursor + 20);
    const size = zip.readUInt32LE(cursor + 24);
    const nameLength = zip.readUInt16LE(cursor + 28);
    const extraLength = zip.readUInt16LE(cursor + 30);
    const commentLength = zip.readUInt16LE(cursor + 32);
    const localAt = zip.readUInt32LE(cursor + 42);
    const name = zip.toString(
      "utf8",
      cursor + CENTRAL_HEADER_SIZE,
      cursor + CENTRAL_HEADER_SIZE + nameLength
    );
    cursor += CENTRAL_HEADER_SIZE + nameLength + extraLength + commentLength;

    if (name.endsWith("/")) continue;
    if (flags & ENCRYPTED_FLAG) throw new ZipReadError("unsupported");
    if (method !== STORED && method !== DEFLATED) throw new ZipReadError("unsupported");
    if (compressedSize === ZIP64_MARKER || size === ZIP64_MARKER) {
      throw new ZipReadError("unsupported");
    }

    totalBytes += size;
    if (size > limits.maxEntryBytes || totalBytes > limits.maxTotalBytes) {
      throw new ZipReadError("too-large");
    }
    if (localAt + LOCAL_HEADER_SIZE > zip.length) throw new ZipReadError("corrupt");
    if (zip.readUInt32LE(localAt) !== LOCAL_HEADER_SIGNATURE) throw new ZipReadError("corrupt");

    const dataAt =
      localAt + LOCAL_HEADER_SIZE + zip.readUInt16LE(localAt + 26) + zip.readUInt16LE(localAt + 28);
    if (dataAt + compressedSize > zip.length) throw new ZipReadError("corrupt");

    const stored = zip.subarray(dataAt, dataAt + compressedSize);
    let content: Buffer;
    try {
      content =
        method === STORED
          ? stored
          : inflateRawSync(stored, { maxOutputLength: limits.maxEntryBytes });
    } catch (error) {
      const isTooLarge = (error as { code?: string }).code === "ERR_BUFFER_TOO_LARGE";
      throw new ZipReadError(isTooLarge ? "too-large" : "corrupt");
    }

    if (content.length !== size || crc32(content) !== expectedCrc)
      throw new ZipReadError("corrupt");
    entries.push({ name, content });
  }

  return entries;
}
