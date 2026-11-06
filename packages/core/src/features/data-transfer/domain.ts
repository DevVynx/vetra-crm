import { csvOf, textCell } from "./helpers/csv";
import { dayOf, instantFormatterOf, moneyCell, phoneCell } from "./helpers/formats";

type StageRole = "entry" | "middle" | "closing" | "archive";
type NextActionType = "first_approach" | "follow_up" | "meeting" | "proposal" | "custom";

type LeadRow = {
  id: string;
  businessName: string;
  contactName: string | null;
  niche: string;
  city: string;
  phone: string;
  email: string | null;
  demoUrl: string | null;
  stageId: string;
  stoppedAtStageId: string | null;
  stageChangedAt: Date;
  prospectedAt: Date;
  lastContactAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type DealRow = {
  leadId: string;
  closedAt: Date;
  closedValueInCents: number;
  document: string | null;
  monthlyFeeInCents: number | null;
};

type StageRow = {
  id: string;
  name: string;
  color: string;
  role: StageRole;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

type ProjectRow = {
  id: string;
  leadId: string;
  name: string;
  valueInCents: number;
  status: "in_production" | "delivered";
  startedAt: Date;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type InstallmentRow = {
  id: string;
  leadId: string;
  projectId: string | null;
  description: string;
  amountInCents: number;
  dueAt: Date;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ExpenseRow = {
  id: string;
  leadId: string;
  projectId: string | null;
  description: string;
  amountInCents: number;
  status: "confirmed" | "pending";
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type NoteRow = {
  id: string;
  leadId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type NextActionRow = {
  id: string;
  leadId: string;
  type: NextActionType;
  followUpStep: number | null;
  description: string;
  dueAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ExportData = {
  leads: LeadRow[];
  deals: DealRow[];
  stages: StageRow[];
  projects: ProjectRow[];
  installments: InstallmentRow[];
  expenses: ExpenseRow[];
  notes: NoteRow[];
  nextActions: NextActionRow[];
};

export type ExportFile = { name: string; csv: string };

const STAGE_ROLE_WORDS: Record<StageRole, string> = {
  entry: "entrada",
  middle: "intermediaria",
  closing: "fechamento",
  archive: "arquivo",
};

const PROJECT_STATUS_WORDS = { in_production: "em_producao", delivered: "entregue" } as const;
const EXPENSE_STATUS_WORDS = { confirmed: "confirmada", pending: "pendente" } as const;

const NEXT_ACTION_WORDS: Record<NextActionType, string> = {
  first_approach: "primeira_abordagem",
  follow_up: "follow_up",
  meeting: "reuniao",
  proposal: "proposta",
  custom: "personalizada",
};

const optionalNumber = (value: number | null) => (value === null ? "" : String(value));

function leadsFile(data: ExportData, formatInstant: ReturnType<typeof instantFormatterOf>) {
  const stageNames = new Map(data.stages.map((stage) => [stage.id, stage.name]));
  const dealsByLead = new Map(data.deals.map((deal) => [deal.leadId, deal]));

  const rows = data.leads.map((lead) => {
    const deal = dealsByLead.get(lead.id);

    return [
      lead.id,
      textCell(lead.businessName),
      textCell(lead.contactName),
      textCell(lead.niche),
      textCell(lead.city),
      phoneCell(lead.phone),
      textCell(lead.email),
      textCell(lead.demoUrl),
      textCell(stageNames.get(lead.stageId) ?? ""),
      textCell(lead.stoppedAtStageId ? (stageNames.get(lead.stoppedAtStageId) ?? "") : ""),
      formatInstant(lead.stageChangedAt),
      formatInstant(lead.prospectedAt),
      formatInstant(lead.lastContactAt),
      deal ? "sim" : "nao",
      formatInstant(deal?.closedAt ?? null),
      moneyCell(deal?.closedValueInCents ?? null),
      textCell(deal?.document ?? null),
      moneyCell(deal?.monthlyFeeInCents ?? null),
      formatInstant(lead.createdAt),
      formatInstant(lead.updatedAt),
    ];
  });

  return {
    name: "leads.csv",
    csv: csvOf(
      [
        "id",
        "empresa",
        "contato",
        "nicho",
        "cidade",
        "telefone",
        "email",
        "link_demo",
        "etapa",
        "etapa_onde_parou",
        "etapa_alterada_em",
        "prospectado_em",
        "ultimo_contato_em",
        "cliente",
        "fechado_em",
        "valor_fechado",
        "documento",
        "mensalidade",
        "criado_em",
        "atualizado_em",
      ],
      rows
    ),
  };
}

function exportFiles(data: ExportData, timeZone: string): ExportFile[] {
  const formatInstant = instantFormatterOf(timeZone);

  return [
    leadsFile(data, formatInstant),
    {
      name: "projetos.csv",
      csv: csvOf(
        [
          "id",
          "lead_id",
          "nome",
          "valor",
          "status",
          "iniciado_em",
          "entregue_em",
          "criado_em",
          "atualizado_em",
        ],
        data.projects.map((project) => [
          project.id,
          project.leadId,
          textCell(project.name),
          moneyCell(project.valueInCents),
          PROJECT_STATUS_WORDS[project.status],
          formatInstant(project.startedAt),
          formatInstant(project.deliveredAt),
          formatInstant(project.createdAt),
          formatInstant(project.updatedAt),
        ])
      ),
    },
    {
      name: "parcelas.csv",
      csv: csvOf(
        [
          "id",
          "lead_id",
          "projeto_id",
          "descricao",
          "valor",
          "vencimento",
          "pago_em",
          "criado_em",
          "atualizado_em",
        ],
        data.installments.map((installment) => [
          installment.id,
          installment.leadId,
          installment.projectId ?? "",
          textCell(installment.description),
          moneyCell(installment.amountInCents),
          formatInstant(installment.dueAt),
          formatInstant(installment.paidAt),
          formatInstant(installment.createdAt),
          formatInstant(installment.updatedAt),
        ])
      ),
    },
    {
      name: "despesas.csv",
      csv: csvOf(
        [
          "id",
          "lead_id",
          "projeto_id",
          "descricao",
          "valor",
          "status",
          "data",
          "criado_em",
          "atualizado_em",
        ],
        data.expenses.map((expense) => [
          expense.id,
          expense.leadId,
          expense.projectId ?? "",
          textCell(expense.description),
          moneyCell(expense.amountInCents),
          EXPENSE_STATUS_WORDS[expense.status],
          formatInstant(expense.occurredAt),
          formatInstant(expense.createdAt),
          formatInstant(expense.updatedAt),
        ])
      ),
    },
    {
      name: "notas.csv",
      csv: csvOf(
        ["id", "lead_id", "conteudo", "criada_em", "atualizada_em"],
        data.notes.map((note) => [
          note.id,
          note.leadId,
          textCell(note.content),
          formatInstant(note.createdAt),
          formatInstant(note.updatedAt),
        ])
      ),
    },
    {
      name: "atividades.csv",
      csv: csvOf(
        [
          "id",
          "lead_id",
          "tipo",
          "passo_follow_up",
          "descricao",
          "vence_em",
          "criado_em",
          "atualizado_em",
        ],
        data.nextActions.map((action) => [
          action.id,
          action.leadId,
          NEXT_ACTION_WORDS[action.type],
          optionalNumber(action.followUpStep),
          textCell(action.description),
          formatInstant(action.dueAt),
          formatInstant(action.createdAt),
          formatInstant(action.updatedAt),
        ])
      ),
    },
    {
      name: "etapas.csv",
      csv: csvOf(
        ["id", "nome", "cor", "papel", "posicao", "criado_em", "atualizado_em"],
        data.stages.map((stage) => [
          stage.id,
          textCell(stage.name),
          textCell(stage.color),
          STAGE_ROLE_WORDS[stage.role],
          String(stage.position),
          formatInstant(stage.createdAt),
          formatInstant(stage.updatedAt),
        ])
      ),
    },
  ];
}

const exportFilename = (now: Date, timeZone: string) => `vetra-dados-${dayOf(now, timeZone)}.zip`;

export const dataTransferDomain = { exportFiles, exportFilename };
