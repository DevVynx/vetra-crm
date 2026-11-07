// A fake WAHA for demonstrations of Vetra: it never talks to WhatsApp. It keeps the conversations of demo/.generated/chats.json
// in memory, answers the few endpoints Vetra uses and "sends" the messages Vetra asks for (only into its memory).
//
// Control endpoints, without the API key, for whoever presents:
//   POST /__incoming  { phone, text }   the lead writes to the user, as if from the phone
//   POST /__autoreply { seconds }       a lead answers by itself that many seconds after Vetra writes to it (0 turns it off)
//   GET  /__state                       what Vetra sent
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 3000);
const KEY = process.env.WAHA_API_KEY ?? "demo-waha-key";
const CHATS_FILE = process.env.CHATS_FILE ?? "/data/chats.json";
const ME = "5531900000000";

const now = () => Math.floor(Date.now() / 1000);
const message = (id, timestamp, fromMe, body, extra = {}) => ({
  id,
  timestamp,
  fromMe,
  from: "x@lid",
  to: null,
  body,
  hasMedia: false,
  media: null,
  ...extra,
});

// WhatsApp writes a Brazilian mobile number without the ninth digit in the chat id.
const chatIdOf = (phone) => `${phone.replace(/^(55\d{2})9(\d{8})$/, "$1$2")}@c.us`;
const phoneOf = (chatId) => chatId.replace(/@.*/, "");

const state = {
  status: "WORKING",
  chats: {},
  sent: [],
  autoReplySeconds: 25,
  replying: new Set(),
  replyCount: 0,
};

function loadChats() {
  if (!existsSync(CHATS_FILE)) return;
  // Each chat of the file: { phone, name, messages: [{ fromMe, text, minutesAgo }] }, oldest first.
  for (const chat of JSON.parse(readFileSync(CHATS_FILE, "utf8"))) {
    const id = chatIdOf(chat.phone);
    const messages = chat.messages.map((item, index) =>
      message(
        `d${chat.phone}x${index}`,
        now() - Math.round(item.minutesAgo * 60),
        item.fromMe,
        item.text,
        item.fromMe ? { ackName: "READ" } : {}
      )
    );
    state.chats[id] = {
      name: chat.name ?? null,
      picture: null,
      messages: messages.sort((a, b) => b.timestamp - a.timestamp),
    };
  }
  console.log(`fake WAHA: ${Object.keys(state.chats).length} conversations loaded`);
}
loadChats();

const CANNED_REPLIES = [
  "Oi! Gostei da prévia, ficou bem legal. Dá para ver valores?",
  "Opa, vi sim! Pode me explicar como funciona?",
  "Interessante! Me manda mais detalhes, por favor.",
  "Obrigado por mandar. Vou mostrar para o meu sócio e te retorno.",
];

let socket = null;
const frame = (text) => {
  const payload = Buffer.from(text);
  const header =
    payload.length < 126
      ? Buffer.from([0x81, payload.length])
      : Buffer.from([0x81, 126, payload.length >> 8, payload.length & 255]);
  return Buffer.concat([header, payload]);
};
const push = (event, payload) =>
  socket?.write(frame(JSON.stringify({ event, session: "default", payload })));

function receive(phone, text) {
  const chatId = chatIdOf(phone);
  const incoming = message(`in${Date.now()}`, now(), false, text, {
    from: "999@lid",
    _data: {
      Info: {
        Chat: "999@lid",
        SenderAlt: `${phone}@s.whatsapp.net`,
        PushName: state.chats[chatId]?.name ?? "Contato",
      },
    },
  });
  (state.chats[chatId] ??= { name: null, picture: null, messages: [] }).messages.unshift(incoming);
  push("message.any", incoming);
}

// One answer for each burst of messages Vetra sends (a text of several bubbles is one burst).
function scheduleAutoReply(chatId) {
  if (state.autoReplySeconds <= 0 || state.replying.has(chatId)) return;
  state.replying.add(chatId);
  setTimeout(() => {
    state.replying.delete(chatId);
    receive(phoneOf(chatId), CANNED_REPLIES[state.replyCount++ % CANNED_REPLIES.length]);
  }, state.autoReplySeconds * 1000);
}

const readBody = (req) =>
  new Promise((resolve) => {
    let text = "";
    req.on("data", (chunk) => (text += chunk));
    req.on("end", () => resolve(text ? JSON.parse(text) : {}));
  });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const json = (data, status = 200) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(data));
  };

  if (url.pathname === "/__incoming") {
    const { phone, text } = await readBody(req);
    receive(phone, text);
    return json({});
  }
  if (url.pathname === "/__autoreply") {
    state.autoReplySeconds = Number((await readBody(req)).seconds ?? 0);
    return json({ seconds: state.autoReplySeconds });
  }
  if (url.pathname === "/__state")
    return json({ sent: state.sent, autoReplySeconds: state.autoReplySeconds });

  if (req.headers["x-api-key"] !== KEY) return json({ error: "unauthorized" }, 401);

  if (url.pathname === "/api/sessions/default" && req.method === "GET") {
    return json({
      status: state.status,
      me: state.status === "WORKING" ? { id: `${ME}@c.us` } : null,
    });
  }
  if (
    url.pathname === "/api/sessions/default/logout" ||
    url.pathname === "/api/sessions/default/stop"
  ) {
    state.status = "STOPPED";
    push("session.status", { status: "STOPPED" });
    return json({});
  }
  if (url.pathname === "/api/sessions/default/start") {
    state.status = "WORKING";
    push("session.status", { status: "WORKING" });
    return json({});
  }
  if (url.pathname === "/api/default/chats/overview") {
    const items = Object.entries(state.chats).map(([id, chat]) => ({
      id,
      name: chat.name,
      picture: chat.picture,
      lastMessage: chat.messages[0] ?? null,
    }));
    const offset = Number(url.searchParams.get("offset") ?? 0);
    return json(
      items.slice(offset, offset + Number(url.searchParams.get("limit") ?? items.length))
    );
  }
  if (/^\/api\/default\/chats\/[^/]+\/messages\/read$/.test(url.pathname)) return json({});
  const messages = /^\/api\/default\/chats\/([^/]+)\/messages$/.exec(url.pathname);
  if (messages) {
    const chat = state.chats[decodeURIComponent(messages[1])];
    const offset = Number(url.searchParams.get("offset") ?? 0);
    return json(
      (chat?.messages ?? []).slice(offset, offset + Number(url.searchParams.get("limit") ?? 100))
    );
  }
  if (url.pathname === "/api/contacts/check-exists") {
    const phone = String(url.searchParams.get("phone") ?? "");
    return json({ numberExists: true, chatId: chatIdOf(phone) });
  }
  if (/^\/api\/default\/lids\//.test(url.pathname))
    return json({ lid: url.pathname.split("/").pop(), pn: null });
  if (url.pathname === "/api/contacts/all") return json([]);
  if (url.pathname === "/api/contacts/profile-picture") return json({ profilePictureURL: null });

  if (url.pathname === "/api/sendText" && req.method === "POST") {
    const { chatId, text } = await readBody(req);
    const id = `sent${state.sent.length}${Date.now()}`;
    state.sent.push({ chatId, text, at: new Date().toISOString() });
    const sent = message(id, now(), true, text, {
      ackName: "SERVER",
      from: "111@lid",
      _data: {
        Info: { Chat: "222@lid", RecipientAlt: chatId.replace("@c.us", "@s.whatsapp.net") },
      },
    });
    (state.chats[chatId] ??= { name: null, picture: null, messages: [] }).messages.unshift(sent);
    setTimeout(() => push("message.any", sent), 300);
    scheduleAutoReply(chatId);
    return json({ id: `true_${chatId}_${id}`, timestamp: now() });
  }
  return json({ error: "not found" }, 404);
});

server.on("upgrade", (req, sock) => {
  const accept = createHash("sha1")
    .update(`${req.headers["sec-websocket-key"]}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");
  sock.write(
    `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  socket = sock;
  sock.on("error", () => {});
});

server.listen(PORT, "0.0.0.0", () => console.log(`fake WAHA ready on ${PORT}`));
