// Reads the leads of the demo database and writes demo/.generated/chats.json: a conversation for each lead that was already
// contacted, shaped by the stage it is in, so the WhatsApp screen, the lead pages and the "conversas esperando você" panel of the
// Painel have something real to show. The fake WhatsApp (demo/fake-waha.mjs) serves this file.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), ".generated", "chats.json");
const DB_CONTAINER = "vetra_demo_db";

const query = `
  select coalesce(json_agg(t order by t.phone), '[]') from (
    select l.phone, l.business_name, l.contact_name, l.do_not_contact, s.name as stage, s.role,
           extract(epoch from l.last_contact_at) as last_contact, extract(epoch from l.stage_changed_at) as stage_changed
    from leads l join stages s on s.id = l.stage_id
  ) t`;
const leads = JSON.parse(
  execFileSync(
    "docker",
    ["exec", DB_CONTAINER, "psql", "-U", "dev", "-d", "vetra", "-At", "-c", query],
    { encoding: "utf8" }
  ).trim()
);

const slug = (text) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const plain = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const out = (text) => ({ fromMe: true, text });
const inn = (text) => ({ fromMe: false, text });

const approach = (lead) => [
  out("Olá! Eu sou o Vinicius."),
  out(
    `Estive olhando ${lead.business_name} e percebi que vocês ainda não têm um site que mostre bem o trabalho de vocês.`
  ),
  out(
    `Montei uma prévia usando o logo e as fotos que vocês já divulgam. Dá uma espiada: https://${slug(lead.business_name)}.vercel.app`
  ),
  out("Não tem compromisso nenhum. É só para você ver como poderia ficar."),
];

// Each stage tells a different moment of the same story. `awaiting` leaves the last message with the lead, which is what
// lists the conversation as waiting for the user.
const scenarios = {
  abordagem: (lead) => approach(lead),
  conversando: (lead, index) => [
    ...approach(lead),
    inn("Oi! Vi a prévia, ficou bem legal. Dá para ajustar as cores?"),
    out("Claro! Me diz quais cores vocês usam que eu ajusto hoje mesmo."),
    ...(index % 2 === 0
      ? [inn("Usamos azul e branco. Pode mandar de novo quando estiver pronto?")]
      : []),
  ],
  reuniao: (lead) => [
    ...approach(lead),
    inn("Gostei bastante. Podemos conversar por vídeo?"),
    out("Podemos sim! Quinta às 15h funciona para você?"),
    inn("Funciona! Pode me mandar o link."),
    out("Perfeito, mando o link na quinta de manhã. Até lá!"),
  ],
  proposta: (lead) => [
    ...approach(lead),
    inn("Pode me passar os valores?"),
    out(
      "Segue a proposta: site completo, com domínio e hospedagem no primeiro ano. Valor: R$ 1.800,00, em até 3x."
    ),
    inn("Obrigado! Vou ver com meu sócio e te retorno."),
  ],
  fechado: (lead) => [
    ...approach(lead),
    inn("Fechado! Pode seguir com o site."),
    out("Maravilha, bem-vindo! Já começo hoje."),
    inn("O site ficou ótimo, muito obrigado!"),
  ],
  semResposta: (lead) => approach(lead),
  semInteresse: () => [
    out("Olá! Eu sou o Vinicius. Montei uma prévia de site para vocês, quer dar uma olhada?"),
    inn("Não temos interesse no momento, obrigado."),
  ],
  recusa: (lead) => [...approach(lead), inn("Por favor, não me procurem mais por aqui.")],
};

function scenarioFor(lead) {
  if (lead.do_not_contact) return scenarios.recusa;
  const stage = plain(lead.stage);
  if (lead.role === "entry") return null;
  if (lead.role === "closing") return scenarios.fechado;
  if (lead.role === "archive")
    return stage.includes("resposta") ? scenarios.semResposta : scenarios.semInteresse;
  if (stage.includes("abordagem")) return scenarios.abordagem;
  if (stage.includes("conversa")) return scenarios.conversando;
  if (stage.includes("reuni")) return scenarios.reuniao;
  if (stage.includes("proposta")) return scenarios.proposta;
  return scenarios.abordagem;
}

const nowSeconds = Math.floor(Date.now() / 1000);
// The gap, in minutes, before each message counted from the last one backwards: the last messages are close, the first ones old.
const GAPS = [0, 25, 90, 240, 600, 900, 1200, 1500, 1500, 1500];

const chats = leads.flatMap((lead, index) => {
  const scenario = scenarioFor(lead);
  if (!scenario) return [];

  const messages = scenario(lead, index);
  const lastAt = Math.min(Number(lead.last_contact ?? lead.stage_changed), nowSeconds - 300);
  const lastMinutesAgo = Math.max(5, (nowSeconds - lastAt) / 60);
  let backwards = lastMinutesAgo;
  const dated = [...messages].reverse().map((message, position) => {
    backwards += GAPS[Math.min(position, GAPS.length - 1)];
    return { ...message, minutesAgo: backwards };
  });

  return [
    { phone: lead.phone, name: lead.contact_name ?? lead.business_name, messages: dated.reverse() },
  ];
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(chats, null, 2));
const awaiting = chats.filter((chat) => !chat.messages.at(-1).fromMe).length;
console.log(`${chats.length} conversas geradas (${awaiting} esperando resposta do usuário).`);
