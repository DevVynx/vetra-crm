import { v7 as uuidv7 } from "uuid";

import { canonicalPhoneOf } from "../../../shared/phone";
import type { Lead } from "../../leads/domain";
import type { Stage } from "../../stages/domain";
import { type CsvRow, parseCsv } from "./parseCsv";
import {
  isEmail,
  isHttpUrl,
  MAX_INTEGER,
  readInstant,
  readMoneyInCents,
  readPhone,
  unquoted,
} from "./readValues";
import { EXPENSE_STATUS_WORDS, fromWords, NEXT_ACTION_WORDS, PROJECT_STATUS_WORDS } from "./words";

export type ImportError = { file: string; line: number; column: string | null; code: string };
export type ImportCounts = { new: number; skipped: number; invalid: number };
export type ImportSkippedLead = { line: number; name: string; reason: "exists" | "repeated" };

export type ImportReport = {
  leads: ImportCounts;
  projects: ImportCounts;
  installments: ImportCounts;
  expenses: ImportCounts;
  notes: ImportCounts;
  activities: ImportCounts;
  completedActivities: ImportCounts;
  errors: ImportError[];
  hiddenErrors: number;
  skippedLeads: ImportSkippedLead[];
  hiddenSkippedLeads: number;
};

type NewDeal = {
  id: string;
  leadId: string;
  closedAt: Date;
  closedValueInCents: number;
  document: string | null;
  monthlyFeeInCents: number | null;
};

type NewProject = {
  id: string;
  leadId: string;
  name: string;
  valueInCents: number;
  status: "in_production" | "delivered";
  startedAt: Date;
  deliveredAt: Date | null;
};

type NewInstallment = {
  id: string;
  leadId: string;
  projectId: string | null;
  description: string;
  amountInCents: number;
  dueAt: Date;
  paidAt: Date | null;
};

type NewExpense = {
  id: string;
  leadId: string;
  projectId: string | null;
  description: string;
  amountInCents: number;
  status: "confirmed" | "pending";
  occurredAt: Date;
};

type NewNote = { id: string; leadId: string; content: string; createdAt: Date; updatedAt: Date };

type NewNextAction = {
  id: string;
  leadId: string;
  type: "first_approach" | "follow_up" | "meeting" | "proposal" | "custom";
  followUpStep: number | null;
  description: string;
  body: string | null;
  dueAt: Date;
};

type NewCompletedAction = NewNextAction & { completedAt: Date };

export type ImportRecords = {
  leads: Lead[];
  deals: NewDeal[];
  projects: NewProject[];
  installments: NewInstallment[];
  expenses: NewExpense[];
  notes: NewNote[];
  nextActions: NewNextAction[];
  completedActions: NewCompletedAction[];
};

export type ImportContext = {
  timeZone: string;
  stages: Stage[];
  existingPhoneKeys: Set<string>;
  existingSlugs: Set<string>;
  // What a lead with no "envio_automatico" column starts with.
  newLeadsAutoSend: boolean;
  now: Date;
};

export type ImportPlan = { records: ImportRecords; report: ImportReport };

const MAX_LISTED = 100;
const MAX_TEXT = {
  business: 120,
  contact: 120,
  niche: 60,
  city: 60,
  document: 40,
  name: 200,
  description: 1000,
  // Equal to the limits of the contracts (nextAction.ts, pipeline.ts), which core does not import.
  body: 4000,
  slug: 80,
  note: 20_000,
};
const LEAD_HEADERS = ["empresa", "nicho", "cidade", "telefone"];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROJECT_STATUSES = fromWords(PROJECT_STATUS_WORDS);
const EXPENSE_STATUSES = fromWords(EXPENSE_STATUS_WORDS);
const ACTION_TYPES = fromWords(NEXT_ACTION_WORDS);
const normalizedName = (name: string) => name.trim().toLowerCase();

type LeadStatus = { kind: "new"; id: string } | { kind: "skipped" } | { kind: "invalid" };

type State = {
  errors: ImportError[];
  records: ImportRecords;
  counts: Record<
    Exclude<keyof ImportReport, "errors" | "hiddenErrors" | "skippedLeads" | "hiddenSkippedLeads">,
    ImportCounts
  >;
  skippedLeads: ImportSkippedLead[];
  leadStatus: Map<string, LeadStatus>;
  projectIds: Map<string, string | null>;
};

// Reads the cells of one row. Every problem is recorded with its file, line and column, and the
// row is marked invalid, but reading goes on so one row reports all its problems at once.
function readerOf(file: string, row: CsvRow, errors: ImportError[], timeZone: string) {
  let isValid = true;
  const fail = (column: string, code: string) => {
    isValid = false;
    errors.push({ file, line: row.line, column, code });
  };
  const raw = (column: string) => unquoted((row.values.get(column) ?? "").trim());

  const optional = (column: string, max: number): string | null => {
    const value = raw(column);
    if (value.length > max) fail(column, "too_long");
    // The database refuses it in a text, and only when writing: the preview has to say so.
    if (value.includes("\u0000")) fail(column, "invalid_value");

    return value === "" ? null : value;
  };
  const required = (column: string, max: number): string => {
    const value = optional(column, max);
    if (value === null) fail(column, "required");

    return value ?? "";
  };
  const instant = (column: string): Date | null => {
    const value = readInstant(raw(column), timeZone);
    if (value === undefined) fail(column, "invalid_date");

    return value ?? null;
  };
  const requiredInstant = (column: string): Date => {
    const value = readInstant(raw(column), timeZone);
    if (value === undefined) fail(column, "invalid_date");
    else if (value === null) fail(column, "required");

    return value ?? new Date(0);
  };
  const money = (column: string): number | null => {
    const value = readMoneyInCents(raw(column));
    if (value === undefined) fail(column, "invalid_money");

    return value ?? null;
  };
  const requiredMoney = (column: string): number => {
    const value = readMoneyInCents(raw(column));
    if (value === undefined) fail(column, "invalid_money");
    else if (value === null) fail(column, "required");

    return value ?? 0;
  };
  const oneOf = <Code>(column: string, codes: Map<string, Code>): Code | null => {
    const value = raw(column).toLowerCase();
    const code = codes.get(value);
    if (code === undefined) fail(column, value === "" ? "required" : "invalid_value");

    return code ?? null;
  };

  return {
    isValid: () => isValid,
    raw,
    fail,
    optional,
    required,
    instant,
    requiredInstant,
    money,
    requiredMoney,
    oneOf,
  };
}

type Reader = ReturnType<typeof readerOf>;

function tableOf(files: Map<string, string>, file: string, headers: string[], state: State) {
  const content = files.get(file);
  if (content === undefined) return null;

  const table = parseCsv(content);
  if (table.hasTooManyRows) {
    state.errors.push({ file, line: 0, column: null, code: "too_many_rows" });
    return null;
  }

  const absent = headers.filter((header) => !table.headers.includes(header));
  for (const header of absent) {
    state.errors.push({ file, line: 1, column: header, code: "missing_column" });
  }

  return absent.length > 0 ? null : table;
}

function readLeads(files: Map<string, string>, context: ImportContext, state: State) {
  const file = "leads.csv";
  if (!files.has(file)) {
    state.errors.push({ file, line: 0, column: null, code: "missing_file" });
    return;
  }

  const table = tableOf(files, file, LEAD_HEADERS, state);
  if (!table) return;

  const stages = new Map(context.stages.map((stage) => [normalizedName(stage.name), stage]));
  const entryStage = context.stages.find((item) => item.role === "entry");
  const seenPhoneKeys = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const row of table.rows) {
    const reader = readerOf(file, row, state.errors, context.timeZone);
    const key = reader.raw("id") || `line-${row.line}`;

    if (state.leadStatus.has(key)) reader.fail("id", "duplicated_id");

    const businessName = reader.required("empresa", MAX_TEXT.business);
    const contactName = reader.optional("contato", MAX_TEXT.contact);
    const niche = reader.required("nicho", MAX_TEXT.niche);
    const city = reader.required("cidade", MAX_TEXT.city);

    const rawPhone = reader.raw("telefone");
    const phone = readPhone(rawPhone);
    if (phone === undefined)
      reader.fail("telefone", rawPhone === "" ? "required" : "invalid_phone");

    const email = reader.optional("email", 254);
    if (email !== null && !isEmail(email)) reader.fail("email", "invalid_email");
    const demoUrl = reader.optional("link_demo", 2048);
    if (demoUrl !== null && !isHttpUrl(demoUrl)) reader.fail("link_demo", "invalid_url");

    const slug = reader.optional("slug", MAX_TEXT.slug);
    if (slug !== null && !SLUG.test(slug)) reader.fail("slug", "invalid_value");

    const rawDoNotContact = reader.raw("nao_contatar").toLowerCase();
    if (!["", "sim", "nao", "não"].includes(rawDoNotContact)) {
      reader.fail("nao_contatar", "invalid_value");
    }

    const rawAutoSend = reader.raw("envio_automatico").toLowerCase();
    if (!["", "sim", "nao", "não"].includes(rawAutoSend)) {
      reader.fail("envio_automatico", "invalid_value");
    }
    const autoSend = rawAutoSend === "" ? context.newLeadsAutoSend : rawAutoSend === "sim";

    // Without a stage the lead starts where every new one does, so a file made elsewhere does not
    // depend on the name of a stage, which the user can change.
    const stageName = reader.optional("etapa", MAX_TEXT.name);
    const stage = stageName === null ? entryStage : stages.get(normalizedName(stageName));
    if (stageName !== null && !stage) reader.fail("etapa", "unknown_stage");

    let stoppedAtStageId: string | null = null;
    const stoppedName = reader.optional("etapa_onde_parou", MAX_TEXT.name);
    if (stage?.role === "archive" && stoppedName !== null) {
      const stopped = stages.get(normalizedName(stoppedName));
      const isLive = stopped?.role === "entry" || stopped?.role === "middle";
      if (isLive) stoppedAtStageId = stopped.id;
      else reader.fail("etapa_onde_parou", stopped ? "invalid_value" : "unknown_stage");
    }

    const isCustomer = reader.raw("cliente").toLowerCase();
    if (isCustomer !== "" && isCustomer !== "sim" && isCustomer !== "nao" && isCustomer !== "não") {
      reader.fail("cliente", "invalid_value");
    }
    const wantsDeal = isCustomer === "sim";
    if (stage && wantsDeal !== (stage.role === "closing")) {
      reader.fail("cliente", "inconsistent_customer");
    }

    const prospectedAt = reader.instant("prospectado_em") ?? context.now;
    const stageChangedAt = reader.instant("etapa_alterada_em") ?? prospectedAt;
    const lastContactAt = reader.instant("ultimo_contato_em");
    const createdAt = reader.instant("criado_em") ?? context.now;
    const updatedAt = reader.instant("atualizado_em") ?? createdAt;

    let closedAt = context.now;
    let closedValue = 0;
    let document: string | null = null;
    let monthlyFee: number | null = null;
    if (wantsDeal) {
      closedAt = reader.requiredInstant("fechado_em");
      closedValue = reader.requiredMoney("valor_fechado");
      // A closed value of zero is a value, but not one a deal can have. A value that could not be
      // read was already reported, and is not reported twice.
      if (readMoneyInCents(reader.raw("valor_fechado")) === 0) {
        reader.fail("valor_fechado", "invalid_value");
      }
      document = reader.optional("documento", MAX_TEXT.document);
      monthlyFee = reader.money("mensalidade");
    }

    if (!reader.isValid() || phone === undefined || !stage) {
      state.leadStatus.set(key, { kind: "invalid" });
      state.counts.leads.invalid++;
      continue;
    }

    const phoneKey = canonicalPhoneOf(phone);
    const isKnown =
      context.existingPhoneKeys.has(phoneKey) || (slug !== null && context.existingSlugs.has(slug));
    const isRepeated = seenPhoneKeys.has(phoneKey) || (slug !== null && seenSlugs.has(slug));
    const skipReason = isKnown ? "exists" : isRepeated ? "repeated" : null;
    if (skipReason) {
      state.leadStatus.set(key, { kind: "skipped" });
      state.counts.leads.skipped++;
      state.skippedLeads.push({ line: row.line, name: businessName, reason: skipReason });
      continue;
    }
    seenPhoneKeys.add(phoneKey);
    if (slug !== null) seenSlugs.add(slug);

    const lead: Lead = {
      id: uuidv7(),
      businessName,
      contactName,
      niche,
      city,
      phone,
      phoneKey,
      email,
      demoUrl,
      slug,
      // A customer is no longer prospected: it never comes in with these marks on.
      doNotContact: !wantsDeal && rawDoNotContact === "sim",
      autoSend: !wantsDeal && autoSend,
      stageId: stage.id,
      stoppedAtStageId,
      stageChangedAt,
      prospectedAt,
      lastContactAt,
      createdAt,
      updatedAt,
    };
    state.records.leads.push(lead);
    if (wantsDeal) {
      state.records.deals.push({
        id: uuidv7(),
        leadId: lead.id,
        closedAt,
        closedValueInCents: closedValue,
        document,
        monthlyFeeInCents: monthlyFee,
      });
    }
    state.leadStatus.set(key, { kind: "new", id: lead.id });
    state.counts.leads.new++;
  }
}

// The rows of a file that hangs from a lead: the ones of a lead that is not coming in are left out
// and counted, and the others are read by the handler.
function readChildren(
  files: Map<string, string>,
  file: string,
  headers: string[],
  kind: keyof State["counts"],
  context: ImportContext,
  state: State,
  readRow: (reader: Reader, leadId: string, row: CsvRow) => boolean
) {
  const table = tableOf(files, file, ["lead_id", ...headers], state);
  if (!table) return;

  for (const row of table.rows) {
    const reader = readerOf(file, row, state.errors, context.timeZone);
    const status = state.leadStatus.get(reader.raw("lead_id"));

    if (!status) {
      reader.fail("lead_id", "unknown_lead");
      state.counts[kind].invalid++;
    } else if (status.kind !== "new") {
      state.counts[kind].skipped++;
    } else if (readRow(reader, status.id, row) && reader.isValid()) {
      state.counts[kind].new++;
    } else {
      state.counts[kind].invalid++;
    }
  }
}

// The project a row hangs from, once imported. One that is not in the file, or that had an error
// and stayed out, makes the row an error too: it would lose its link and still look fine.
function projectIdOf(reader: Reader, state: State): string | null {
  const fileId = reader.raw("projeto_id");
  if (fileId === "") return null;

  const known = state.projectIds.get(fileId);
  if (known === undefined) reader.fail("projeto_id", "unknown_project");
  else if (known === null) reader.fail("projeto_id", "unimported_project");

  return known ?? null;
}

function readProjects(files: Map<string, string>, context: ImportContext, state: State) {
  readChildren(
    files,
    "projetos.csv",
    ["nome", "valor", "status", "iniciado_em"],
    "projects",
    context,
    state,
    (reader, leadId) => {
      const fileId = reader.raw("id");
      const name = reader.required("nome", MAX_TEXT.name);
      const valueInCents = reader.requiredMoney("valor");
      const status = reader.oneOf("status", PROJECT_STATUSES);
      const startedAt = reader.requiredInstant("iniciado_em");
      const deliveredAt = reader.instant("entregue_em");
      if (!reader.isValid() || !status) {
        if (fileId) state.projectIds.set(fileId, null);
        return false;
      }

      const id = uuidv7();
      state.records.projects.push({
        id,
        leadId,
        name,
        valueInCents,
        status,
        startedAt,
        deliveredAt,
      });
      if (fileId) state.projectIds.set(fileId, id);

      return true;
    }
  );
}

function readInstallments(files: Map<string, string>, context: ImportContext, state: State) {
  readChildren(
    files,
    "parcelas.csv",
    ["descricao", "valor", "vencimento"],
    "installments",
    context,
    state,
    (reader, leadId) => {
      const description = reader.required("descricao", MAX_TEXT.description);
      const amountInCents = reader.requiredMoney("valor");
      const dueAt = reader.requiredInstant("vencimento");
      const paidAt = reader.instant("pago_em");
      const project = projectIdOf(reader, state);
      if (!reader.isValid()) return false;

      state.records.installments.push({
        id: uuidv7(),
        leadId,
        projectId: project,
        description,
        amountInCents,
        dueAt,
        paidAt,
      });

      return true;
    }
  );
}

function readExpenses(files: Map<string, string>, context: ImportContext, state: State) {
  readChildren(
    files,
    "despesas.csv",
    ["descricao", "valor", "status", "data"],
    "expenses",
    context,
    state,
    (reader, leadId) => {
      const description = reader.required("descricao", MAX_TEXT.description);
      const amountInCents = reader.requiredMoney("valor");
      const status = reader.oneOf("status", EXPENSE_STATUSES);
      const occurredAt = reader.requiredInstant("data");
      const project = projectIdOf(reader, state);
      if (!reader.isValid() || !status) return false;

      state.records.expenses.push({
        id: uuidv7(),
        leadId,
        projectId: project,
        description,
        amountInCents,
        status,
        occurredAt,
      });

      return true;
    }
  );
}

function readNotes(files: Map<string, string>, context: ImportContext, state: State) {
  readChildren(files, "notas.csv", ["conteudo"], "notes", context, state, (reader, leadId) => {
    const content = reader.required("conteudo", MAX_TEXT.note);
    const createdAt = reader.instant("criada_em") ?? context.now;
    const updatedAt = reader.instant("atualizada_em") ?? createdAt;
    if (!reader.isValid()) return false;

    state.records.notes.push({ id: uuidv7(), leadId, content, createdAt, updatedAt });

    return true;
  });
}

function readFollowUpStep(reader: Reader): number | null {
  const text = reader.raw("passo_follow_up");
  if (text === "") return null;

  const step = Number(text);
  if (!(Number.isInteger(step) && step >= 1 && step <= MAX_INTEGER)) {
    reader.fail("passo_follow_up", "invalid_value");
  }

  return step;
}

function readActivities(files: Map<string, string>, context: ImportContext, state: State) {
  readChildren(
    files,
    "atividades.csv",
    ["tipo", "descricao", "vence_em"],
    "activities",
    context,
    state,
    (reader, leadId) => {
      const type = reader.oneOf("tipo", ACTION_TYPES);
      const description = reader.required("descricao", MAX_TEXT.description);
      const body = reader.optional("texto", MAX_TEXT.body);
      const dueAt = reader.requiredInstant("vence_em");
      const followUpStep = readFollowUpStep(reader);
      if (!reader.isValid() || !type) return false;

      state.records.nextActions.push({
        id: uuidv7(),
        leadId,
        type,
        followUpStep,
        description,
        body,
        dueAt,
      });

      return true;
    }
  );
}

function readCompletedActivities(files: Map<string, string>, context: ImportContext, state: State) {
  readChildren(
    files,
    "atividades_concluidas.csv",
    ["tipo", "descricao", "vence_em", "concluida_em"],
    "completedActivities",
    context,
    state,
    (reader, leadId) => {
      const type = reader.oneOf("tipo", ACTION_TYPES);
      const description = reader.required("descricao", MAX_TEXT.description);
      const body = reader.optional("texto", MAX_TEXT.body);
      const dueAt = reader.requiredInstant("vence_em");
      const completedAt = reader.requiredInstant("concluida_em");
      const followUpStep = readFollowUpStep(reader);
      if (!reader.isValid() || !type) return false;

      state.records.completedActions.push({
        id: uuidv7(),
        leadId,
        type,
        followUpStep,
        description,
        body,
        dueAt,
        completedAt,
      });

      return true;
    }
  );
}

const emptyCounts = (): ImportCounts => ({ new: 0, skipped: 0, invalid: 0 });

// What importing these files would do, worked out without touching the database. The same plan is
// shown to the user and then written, so what was previewed is what is saved.
export function planImport(files: Map<string, string>, context: ImportContext): ImportPlan {
  const state: State = {
    errors: [],
    records: {
      leads: [],
      deals: [],
      projects: [],
      installments: [],
      expenses: [],
      notes: [],
      nextActions: [],
      completedActions: [],
    },
    counts: {
      leads: emptyCounts(),
      projects: emptyCounts(),
      installments: emptyCounts(),
      expenses: emptyCounts(),
      notes: emptyCounts(),
      activities: emptyCounts(),
      completedActivities: emptyCounts(),
    },
    skippedLeads: [],
    leadStatus: new Map(),
    projectIds: new Map(),
  };

  readLeads(files, context, state);
  readProjects(files, context, state);
  readInstallments(files, context, state);
  readExpenses(files, context, state);
  readNotes(files, context, state);
  readActivities(files, context, state);
  readCompletedActivities(files, context, state);

  return {
    records: state.records,
    report: {
      ...state.counts,
      errors: state.errors.slice(0, MAX_LISTED),
      hiddenErrors: Math.max(0, state.errors.length - MAX_LISTED),
      skippedLeads: state.skippedLeads.slice(0, MAX_LISTED),
      hiddenSkippedLeads: Math.max(0, state.skippedLeads.length - MAX_LISTED),
    },
  };
}
