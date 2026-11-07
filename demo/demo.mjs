// Starts and stops the demonstration environment: a separate Vetra (own database, own volumes), filled by the seed, with a fake
// WhatsApp whose conversations match the leads. Nothing here touches the real Vetra or a real WhatsApp.
//   node demo/demo.mjs up     start it (or start it again from scratch, the demo database is wiped by the seed)
//   node demo/demo.mjs down   remove it, volumes included
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DEMO_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DEMO_DIR, "..");
const COMPOSE = join(DEMO_DIR, "compose.demo.yaml");
const ADDRESS = "http://localhost:14720";
const DEMO_DATABASE_URL = "postgresql://dev:dev@127.0.0.1:55450/vetra";

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
const compose = (...args) => run("docker", ["compose", "-f", COMPOSE, ...args]);
const sql = (statement) =>
  execFileSync(
    "docker",
    ["exec", "vetra_demo_db", "psql", "-U", "dev", "-d", "vetra", "-qAt", "-c", statement],
    { encoding: "utf8" }
  );
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForApp() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`${ADDRESS}/api/profile`, { signal: AbortSignal.timeout(3000) });
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await sleep(2000);
  }
  throw new Error(
    "O Vetra da demo nao respondeu a tempo. Veja: docker compose -f demo/compose.demo.yaml logs app"
  );
}

async function api(path, method = "GET", body) {
  const response = await fetch(`${ADDRESS}/api${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`${method} ${path} respondeu ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// The automations the demo shows: the master switch on, and the reactions to a message sent and to a reply, so the
// presenter sees a lead move by itself. No lead has its own switch on, so nothing is sent unless the presenter asks.
async function configureAutomations() {
  const { stages } = await api("/stages");
  const middle = stages
    .filter((stage) => stage.role === "middle")
    .sort((a, b) => a.position - b.position);
  const idOf = (fragment) =>
    middle.find((stage) => stage.name.toLowerCase().includes(fragment))?.id ?? null;
  const settings = await api("/automations");
  await api("/automations", "PATCH", {
    ...settings,
    autoSendEnabled: true,
    autoSendDelayMinutes: 1,
    newLeadsAutoSend: false,
    moveOnSendEnabled: Boolean(idOf("abordagem")),
    moveOnSendStageId: idOf("abordagem"),
    moveOnReplyEnabled: Boolean(idOf("conversa")),
    moveOnReplyStageId: idOf("conversa"),
    cancelFollowUpsOnReply: true,
    followUpLimit: 1,
  });
}

// Waits for Vetra to import the conversations of the fake WhatsApp, so the demo is not opened half way.
async function waitForConversations(expected) {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (Number(sql("select count(*) from whatsapp_conversations").trim()) >= expected) return;
    await sleep(2000);
  }
}

async function up() {
  // Always from scratch: the seed wipes the leads but not the WhatsApp conversations, so a demo that was already used
  // would keep what happened in it.
  compose("down", "-v");
  mkdirSync(join(DEMO_DIR, ".generated"), { recursive: true });
  // Without chats the fake WhatsApp starts empty; the real ones are made after the seed.
  writeFileSync(join(DEMO_DIR, ".generated", "chats.json"), "[]");

  console.log("1/5 Subindo o banco, o WhatsApp falso e o Vetra da demo...");
  compose("up", "-d", "--wait", "db");
  compose("up", "-d", "waha");
  compose("up", "-d", "--pull", "missing", "app");
  await waitForApp();

  console.log("2/5 Enchendo o banco com os dados de exemplo...");
  run("pnpm", ["--filter", "@vetra/database", "db:seed", "--yes"], {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: DEMO_DATABASE_URL },
  });
  sql("update profile set name = 'Vinicius', onboarded_at = now()");

  console.log("3/5 Gerando as conversas do WhatsApp falso, a partir dos leads...");
  run("node", [join(DEMO_DIR, "make-chats.mjs")]);

  console.log("4/5 Reiniciando o WhatsApp falso para ele carregar as conversas...");
  compose("restart", "waha");
  await waitForConversations(
    JSON.parse(readFileSync(join(DEMO_DIR, ".generated", "chats.json"), "utf8")).length
  );
  await sleep(3000);

  console.log("5/5 Configurando as automacoes da demo...");
  await configureAutomations();

  console.log(`\nPronto! A demo esta em ${ADDRESS}`);
  console.log(
    'Para simular uma resposta de lead: POST http://127.0.0.1:13000/__incoming com {"phone":"<telefone do lead>","text":"..."}.'
  );
  console.log(
    'Quando enviar uma mensagem, o lead responde sozinho depois de uns 25 segundos (desligue com POST /__autoreply {"seconds":0}).'
  );
  console.log("Para remover a demo: pnpm demo:down");
}

function down() {
  compose("down", "-v");
  console.log("Demo removida (containers e volumes).");
}

const command = process.argv[2];
if (command === "up") await up();
else if (command === "down") down();
else {
  console.log("Uso: node demo/demo.mjs up | down");
  process.exit(1);
}
