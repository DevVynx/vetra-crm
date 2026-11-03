import type {
  ConversationSummary,
  CustomerProject,
  LeadDetail,
  LeadNote,
  LeadSummary,
  LedgerEntry,
  NextAction,
  WonDeal,
} from "@vetra/contracts";
import { addDays, addHours, addMinutes, max } from "date-fns";

import { inDays } from "@/shared/utils/dueDates";

import { isEntryStageId } from "./stageRules";

const lead = (
  id: string,
  businessName: string,
  contactName: string | null,
  niche: string,
  city: string,
  stage: string,
  prospectedDaysAgo: number,
  stoppedAtStage: LeadSummary["stoppedAtStage"] = null
): LeadSummary => ({
  id,
  businessName,
  contactName,
  niche,
  city,
  stage,
  prospectedAt: inDays(-prospectedDaysAgo).toISOString(),
  stoppedAtStage,
});

export const mockLeads: LeadSummary[] = [
  lead("lead-1", "Pizzaria Bella Napoli", "Marcos", "Pizzaria", "Ipatinga", "approach_sent", 9),
  lead("lead-2", "Clínica Sorriso", "Dra. Paula", "Dentista", "Coronel Fabriciano", "meeting", 25),
  lead("lead-3", "Barbearia do Zé", "José", "Barbearia", "Timóteo", "conversing", 14),
  lead("lead-4", "Studio Bela Pele", "Maria", "Estética", "Ipatinga", "proposal_sent", 30),
  lead("lead-5", "Auto Center Vale", null, "Automotivo", "Ipatinga", "prospected", 4),
  lead("lead-6", "Academia Corpo Ativo", "Rafael", "Academia", "Timóteo", "approach_sent", 11),
  lead("lead-7", "Hamburgueria Brasa", "Lucas", "Hamburgueria", "Ipaba", "prospected", 1),
  lead(
    "lead-8",
    "Silva & Costa Advocacia",
    "Dr. Henrique",
    "Advocacia",
    "Ipatinga",
    "conversing",
    18
  ),
  lead(
    "lead-9",
    "Pet Shop Amigo Fiel",
    "Carla",
    "Pet shop",
    "Coronel Fabriciano",
    "approach_sent",
    8
  ),
  lead("lead-10", "Doce Encanto Confeitaria", "Ana", "Confeitaria", "Ipatinga", "prospected", 2),
  lead("lead-11", "Fisio Movimento", "Bruno", "Fisioterapia", "Timóteo", "won", 40),
  lead("lead-12", "Lava Jato Brilho", null, "Automotivo", "Ipatinga", "prospected", 5),
  lead("lead-13", "Restaurante Sabor da Terra", "Helena", "Restaurante", "Ipatinga", "won", 45),
  lead("lead-14", "Ótica Visão Clara", "Roberto", "Ótica", "Coronel Fabriciano", "won", 120),
  lead("lead-15", "Mercearia Dona Rosa", "Rosa", "Mercearia", "Timóteo", "won", 60),
  lead("lead-16", "Padaria Pão Quente", "Sérgio", "Padaria", "Ipatinga", "won", 330),
  lead("lead-17", "Consultório Dr. Almeida", "Dr. Almeida", "Médico", "Ipatinga", "won", 260),
  lead("lead-18", "Floricultura Jardim", "Lúcia", "Floricultura", "Ipaba", "won", 200),
  lead("lead-19", "Escola de Inglês Speak", "Fernanda", "Educação", "Timóteo", "won", 150),
  lead("lead-20", "Oficina Motor Forte", "Paulo", "Automotivo", "Coronel Fabriciano", "won", 85),
];

const extraLeadSeeds: [name: string, contact: string | null, niche: string, city: string][] = [
  ["Studio Fit Vida", "Camila", "Academia", "Ipatinga"],
  ["Mecânica Irmãos Souza", "Carlos", "Automotivo", "Timóteo"],
  ["Café Grão Nobre", "Patrícia", "Cafeteria", "Ipatinga"],
  ["Clínica Vet Patas", "Dra. Renata", "Veterinário", "Coronel Fabriciano"],
  ["Salão Beleza Pura", "Juliana", "Salão de beleza", "Ipatinga"],
  ["Imobiliária Vale Azul", "Marcelo", "Imobiliária", "Ipatinga"],
  ["Sorveteria Gelato", null, "Sorveteria", "Timóteo"],
  ["Contábil Prisma", "Eduardo", "Contabilidade", "Ipatinga"],
  ["Loja Moda Viva", "Aline", "Moda", "Coronel Fabriciano"],
  ["Lanchonete do Bairro", "Tadeu", "Lanchonete", "Ipaba"],
  ["Pilates Equilíbrio", "Larissa", "Pilates", "Ipatinga"],
  ["Dedetizadora Segura", "Cláudio", "Dedetização", "Timóteo"],
  ["Funilaria Express", null, "Automotivo", "Ipatinga"],
  ["Papelaria Colorida", "Beatriz", "Papelaria", "Santana do Paraíso"],
  ["Barbearia Navalha", "Diego", "Barbearia", "Ipatinga"],
  ["Pizzaria Forno a Lenha", "Giovanni", "Pizzaria", "Coronel Fabriciano"],
  ["Odonto Prime", "Dr. Fábio", "Dentista", "Ipatinga"],
  ["Studio Nails Bella", "Priscila", "Estética", "Timóteo"],
  ["Hamburgueria Smash", "Rodrigo", "Hamburgueria", "Ipatinga"],
  ["Pet Shop Mundo Animal", "Vanessa", "Pet shop", "Ipaba"],
  ["Advocacia Lima & Rocha", "Dra. Tereza", "Advocacia", "Ipatinga"],
  ["Confeitaria Sabor de Mãe", "Dona Neide", "Confeitaria", "Timóteo"],
  ["Auto Elétrica Faísca", "Wesley", "Automotivo", "Coronel Fabriciano"],
  ["Nutri Vida Clínica", "Dra. Helena", "Nutrição", "Ipatinga"],
  ["Mercadinho Bom Preço", "Sebastião", "Mercearia", "Santana do Paraíso"],
  ["Estúdio Tattoo Ink", "Rafaela", "Tatuagem", "Ipatinga"],
  ["Cross Box Força Total", "Anderson", "Academia", "Timóteo"],
  ["Ótica Lente Certa", "Vera", "Ótica", "Ipatinga"],
  ["Padaria Trigo Dourado", null, "Padaria", "Coronel Fabriciano"],
  ["Psicologia Mente Aberta", "Dra. Luana", "Psicologia", "Ipatinga"],
  ["Lava Rápido Reluz", "Fabrício", "Automotivo", "Timóteo"],
  ["Doceria Brigadeiro Chic", "Mônica", "Confeitaria", "Ipatinga"],
  ["Escola de Música Acorde", "Leandro", "Educação", "Coronel Fabriciano"],
  ["Barbearia Old School", "Jorge", "Barbearia", "Ipaba"],
  ["Restaurante Cantinho Mineiro", "Zilda", "Restaurante", "Ipatinga"],
  ["Fisio Reabilita", "Dr. Marcos", "Fisioterapia", "Timóteo"],
  ["Floricultura Rosa Branca", "Elisa", "Floricultura", "Ipatinga"],
  ["Despachante Rápido", "Nelson", "Despachante", "Coronel Fabriciano"],
  ["Studio de Dança Ritmo", "Karina", "Dança", "Ipatinga"],
  ["Material de Construção Alicerce", "Valdir", "Construção", "Santana do Paraíso"],
];

const extraStagePattern = [
  "prospected",
  "approach_sent",
  "approach_sent",
  "conversing",
  "approach_sent",
  "prospected",
  "meeting",
  "approach_sent",
  "proposal_sent",
  "approach_sent",
];

const extraLeads = extraLeadSeeds.map(([name, contact, niche, city], index) => {
  const liveStage = extraStagePattern[index % extraStagePattern.length] ?? "prospected";
  const isArchived = index % 9 === 5 || index % 11 === 7;
  const stage = index % 9 === 5 ? "lost" : index % 11 === 7 ? "no_response" : liveStage;
  return lead(
    `lead-${21 + index}`,
    name,
    contact,
    niche,
    city,
    stage,
    Math.round((index * 37) / 10) + (index % 3),
    isArchived ? liveStage : null
  );
});
mockLeads.push(...extraLeads);

const slug = (text: string, separator = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), "");

export const mockContactOverrides: Record<
  string,
  Partial<Pick<LeadDetail, "phone" | "email" | "stageChangedAt">>
> = {};

const createdAtFor = (item: LeadSummary, index: number) =>
  addMinutes(new Date(item.prospectedAt), (index * 37) % 480);

const stageChangedAtFor = (item: LeadSummary, index: number): Date => {
  const createdAt = createdAtFor(item, index);
  return isEntryStageId(item.stage) ? createdAt : max([createdAt, inDays(-((index * 5) % 14))]);
};

export function leadContactFor(item: LeadSummary) {
  const index = mockLeads.findIndex((candidate) => candidate.id === item.id);
  const firstName = slug(item.contactName?.split(" ").at(-1) ?? "");
  const createdAt = createdAtFor(item, index);
  const detail: Pick<
    LeadDetail,
    "phone" | "email" | "demoUrl" | "createdAt" | "updatedAt" | "stageChangedAt" | "lastContactAt"
  > = {
    phone: `55319${String((88880000 + index * 7919) % 100000000).padStart(8, "0")}`,
    email: index % 2 === 0 && firstName ? `${firstName}@${slug(item.businessName)}.com.br` : null,
    demoUrl: isEntryStageId(item.stage)
      ? null
      : `https://${slug(item.businessName, "-")}.vercel.app`,
    createdAt: createdAt.toISOString(),
    updatedAt: max([createdAt, addHours(inDays(-(index % 9)), index % 7)]).toISOString(),
    stageChangedAt: stageChangedAtFor(item, index).toISOString(),
    lastContactAt: lastContactFor(item),
    ...mockContactOverrides[item.id],
  };
  return detail;
}

type LeadProfile = Pick<LeadSummary, "businessName" | "contactName" | "niche" | "city">;
type LeadContact = Pick<LeadDetail, "phone" | "email">;

export function addMockLead(
  { phone, email, ...profile }: LeadProfile & LeadContact,
  stage: string
): LeadSummary {
  const created: LeadSummary = {
    id: `lead-${crypto.randomUUID().slice(0, 8)}`,
    ...profile,
    stage,
    prospectedAt: new Date().toISOString(),
    stoppedAtStage: null,
  };
  mockLeads.push(created);
  mockContactOverrides[created.id] = { phone, email };
  return created;
}

export function updateMockLead(
  id: string,
  { phone, email, ...profile }: LeadProfile & LeadContact
): LeadSummary {
  const index = mockLeads.findIndex((item) => item.id === id);
  const current = mockLeads[index];
  if (!current) throw new Error(`Mock lead ${id} not found`);
  const updated = { ...current, ...profile };
  mockLeads[index] = updated;
  mockContactOverrides[id] = { ...mockContactOverrides[id], phone, email };
  return updated;
}

export function lastContactFor(item: LeadSummary): string | null {
  if (isEntryStageId(item.stage)) return null;
  const awaiting = awaitingConversationOf(item.id);
  if (awaiting) return awaiting.lastMessageAt;
  const index = mockLeads.findIndex((candidate) => candidate.id === item.id);
  const daysSinceProspected = Math.max(
    0,
    Math.floor((Date.now() - new Date(item.prospectedAt).getTime()) / 86_400_000)
  );
  const lastContact = inDays(-Math.min((index * 11) % 400, daysSinceProspected));
  return max([lastContact, stageChangedAtFor(item, index)]).toISOString();
}

const leadById = (id: string): LeadSummary => {
  const found = mockLeads.find((item) => item.id === id);
  if (!found) throw new Error(`Mock lead ${id} not found`);
  return found;
};

const action = (
  id: string,
  leadId: string,
  type: NextAction["type"],
  description: string,
  dueAt: Date,
  followUpStep: number | null = null
): NextAction => ({
  id,
  type,
  followUpStep,
  description,
  dueAt: dueAt.toISOString(),
  lead: leadById(leadId),
});

export function buildMockNextActions(): NextAction[] {
  return [
    action("action-1", "lead-1", "follow_up", "Follow-up 2", inDays(-2), 2),
    action("action-2", "lead-6", "follow_up", "Follow-up 1", inDays(-1), 1),
    action("action-3", "lead-4", "custom", "Cobrar retorno da proposta", inDays(-1)),
    action("action-4", "lead-2", "meeting", "Reunião de diagnóstico", addHours(inDays(0), 5)),
    action("action-5", "lead-9", "follow_up", "Follow-up 1", inDays(0), 1),
    action("action-6", "lead-7", "first_approach", "Enviar primeira abordagem", inDays(0)),
    action("action-7", "lead-8", "proposal", "Enviar proposta", addHours(inDays(0), 2)),
    action("action-8", "lead-3", "custom", "Mandar exemplos de sites de barbearia", inDays(1)),
    action("action-9", "lead-5", "first_approach", "Enviar primeira abordagem", inDays(1)),
    action("action-10", "lead-10", "first_approach", "Enviar primeira abordagem", inDays(4)),
    ...buildExtraNextActions(),
  ];
}

const extraActionByStage: Partial<
  Record<string, Pick<NextAction, "type" | "description" | "followUpStep">>
> = {
  prospected: {
    type: "first_approach",
    description: "Enviar primeira abordagem",
    followUpStep: null,
  },
  approach_sent: { type: "follow_up", description: "Follow-up 1", followUpStep: 1 },
  conversing: { type: "custom", description: "Responder dúvidas sobre o site", followUpStep: null },
  meeting: { type: "meeting", description: "Reunião de diagnóstico", followUpStep: null },
  proposal_sent: { type: "custom", description: "Cobrar retorno da proposta", followUpStep: null },
};

function buildExtraNextActions(): NextAction[] {
  return extraLeads
    .filter((item) => extraActionByStage[item.stage])
    .flatMap((item, index) => {
      const template = extraActionByStage[item.stage];
      if (!template || index % 9 === 4) return [];
      const dueInDays = index % 13 === 0 ? 0 : 2 + (index % 12);
      return [
        action(
          `action-extra-${item.id}`,
          item.id,
          template.type,
          template.description,
          inDays(dueInDays),
          template.followUpStep
        ),
      ];
    });
}

let awaitingConversations: ConversationSummary[] | undefined;

export function buildMockAwaitingConversations(): ConversationSummary[] {
  awaitingConversations ??= createAwaitingConversations();
  return awaitingConversations;
}

export const awaitingConversationOf = (leadId: string) =>
  buildMockAwaitingConversations().find((conversation) => conversation.lead?.id === leadId);

function createAwaitingConversations(): ConversationSummary[] {
  const now = new Date();

  return [
    {
      id: "conversation-1",
      contactName: "Maria",
      phone: "5531988887777",
      lead: leadById("lead-4"),
      lastMessagePreview: "E quanto ficaria com o agendamento online?",
      lastMessageAt: addMinutes(now, -12).toISOString(),
      unreadCount: 2,
    },
    {
      id: "conversation-2",
      contactName: "José",
      phone: "5531977776666",
      lead: leadById("lead-3"),
      lastMessagePreview: "Gostei do site! Dá pra colocar os horários?",
      lastMessageAt: addHours(now, -3).toISOString(),
      unreadCount: 1,
    },
    {
      id: "conversation-3",
      contactName: "Contato desconhecido",
      phone: "5531966665555",
      lead: null,
      lastMessagePreview: "Oi, vi o seu trabalho com a pizzaria, faz cardápio digital?",
      lastMessageAt: addHours(now, -20).toISOString(),
      unreadCount: 1,
    },
  ];
}

const installment = (id: string, amountInCents: number, dueAt: Date, paidAt: Date | null) => ({
  id,
  amountInCents,
  dueAt: dueAt.toISOString(),
  paidAt: paidAt?.toISOString() ?? null,
});

export function buildMockWonDeals(): WonDeal[] {
  return [
    {
      leadId: "lead-11",
      closedValueInCents: 300000,
      closedAt: inDays(-6).toISOString(),
      installments: [
        installment("installment-1", 100000, inDays(-6), inDays(-6)),
        installment("installment-2", 100000, inDays(20), null),
        installment("installment-7", 100000, inDays(50), null),
      ],
      monthlyFeeInCents: 12000,
      projectStatus: "in_production",
    },
    {
      leadId: "lead-13",
      closedValueInCents: 240000,
      closedAt: inDays(-12).toISOString(),
      installments: [
        installment("installment-3", 120000, inDays(-12), inDays(-12)),
        installment("installment-4", 120000, inDays(18), null),
      ],
      monthlyFeeInCents: 9000,
      projectStatus: "in_production",
    },
    {
      leadId: "lead-14",
      closedValueInCents: 180000,
      closedAt: inDays(-90).toISOString(),
      installments: [installment("installment-5", 180000, inDays(-90), inDays(-88))],
      monthlyFeeInCents: 15000,
      projectStatus: "delivered",
    },
    {
      leadId: "lead-15",
      closedValueInCents: 200000,
      closedAt: inDays(-35).toISOString(),
      installments: [installment("installment-6", 200000, inDays(-35), inDays(-35))],
      monthlyFeeInCents: null,
      projectStatus: "delivered",
    },
    ...buildMockPastDeals(),
  ];
}

function buildMockPastDeals(): WonDeal[] {
  const pastDeals: [leadId: string, closedDaysAgo: number, valueInCents: number][] = [
    ["lead-16", 300, 160000],
    ["lead-17", 230, 350000],
    ["lead-18", 175, 140000],
    ["lead-19", 120, 260000],
    ["lead-20", 60, 220000],
  ];

  return pastDeals.map(([leadId, closedDaysAgo, valueInCents]) => ({
    leadId,
    closedValueInCents: valueInCents,
    closedAt: inDays(-closedDaysAgo).toISOString(),
    installments: [0, 30].map((offset, index) => {
      const date = inDays(-closedDaysAgo + offset);
      return installment(`${leadId}-installment-${index + 1}`, valueInCents / 2, date, date);
    }),
    monthlyFeeInCents: null,
    projectStatus: "delivered",
  }));
}

// Becomes a setting on the Configurações page.

const note = (id: string, leadId: string, content: string, daysAgo: number, hour: number) => ({
  id,
  leadId,
  content,
  createdAt: addHours(inDays(-daysAgo), hour).toISOString(),
});

export function buildMockNotes(): LeadNote[] {
  return [
    note(
      "note-1",
      "lead-2",
      "Pediu orçamento de site com agendamento online. Prefere falar à tarde.",
      12,
      3
    ),
    note(
      "note-2",
      "lead-2",
      "Reunião marcada para sexta, às 15h. Levar o exemplo da clínica de Ipatinga.",
      3,
      1
    ),
    note(
      "note-3",
      "lead-3",
      "Já tem Instagram forte, mas nenhum site. Foco em horários e localização.",
      10,
      2
    ),
    note(
      "note-4",
      "lead-4",
      "Quer ver como fica o agendamento online antes de decidir. Mandei a demo.",
      8,
      4
    ),
    note(
      "note-5",
      "lead-4",
      "Pediu desconto na proposta. Posso baixar até 10% se fechar essa semana.",
      1,
      2
    ),
    note("note-6", "lead-8", "Quer algo sóbrio, com área de contato e artigos.", 6, 1),
    note(
      "note-7",
      "lead-1",
      "O cardápio muda toda semana. Sugerir um painel simples de edição.",
      5,
      0
    ),
    note("note-8", "lead-6", "Deixou visualizado. Tentar outro horário no follow-up.", 2, 3),
  ];
}

export const mockCustomerDocuments: Record<string, string | null> = {
  "lead-11": "123.456.789-09",
  "lead-13": "12.345.678/0001-90",
  "lead-14": "98.765.432/0001-10",
  "lead-15": null,
  "lead-16": "11.222.333/0001-81",
  "lead-17": "234.567.890-12",
  "lead-18": "45.678.901/0001-23",
  "lead-19": "56.789.012/0001-34",
  "lead-20": "345.678.901-23",
};

const expenseTemplates = [
  { description: "Designer", share: 0.15 },
  { description: "Hospedagem e domínio", share: 0.04 },
  { description: "Impostos", share: 0.06 },
];

export function buildMockExpenses(
  wonDeals: WonDeal[],
  projects: MockProject[]
): Record<string, LedgerEntry[]> {
  return Object.fromEntries(
    wonDeals.map((deal) => [
      deal.leadId,
      expenseTemplates.map((template, index): LedgerEntry => {
        const isPending = deal.projectStatus === "in_production" && index === 2;
        const dealProjects = projects.filter((project) => project.leadId === deal.leadId);
        return {
          id: `${deal.leadId}-expense-${index + 1}`,
          type: "expense",
          description: template.description,
          amountInCents: Math.round(deal.closedValueInCents * template.share),
          status: isPending ? "pending" : "confirmed",
          occurredAt: (isPending
            ? inDays(10)
            : addDays(new Date(deal.closedAt), index * 3 + 1)
          ).toISOString(),
          createdAt: addDays(new Date(deal.closedAt), index).toISOString(),
          projectName: dealProjects[index % dealProjects.length]?.name ?? null,
        };
      }),
    ])
  );
}

export type MockProject = CustomerProject & { leadId: string };

const projectNameByNiche: Record<string, string> = {
  Pizzaria: "Cardápio digital",
  Restaurante: "Cardápio digital",
  Médico: "Site com agendamento",
  Dentista: "Site com agendamento",
  Educação: "Site com matrícula online",
};

export function buildMockProjects(wonDeals: WonDeal[]): MockProject[] {
  return wonDeals.flatMap((deal) => {
    const deliveredAt =
      deal.projectStatus === "delivered"
        ? addDays(new Date(deal.closedAt), 25).toISOString()
        : null;
    const base = {
      leadId: deal.leadId,
      status: deal.projectStatus,
      startedAt: deal.closedAt,
      deliveredAt,
    };

    if (deal.leadId === "lead-14") {
      const firstValue = 120000;
      return [
        { ...base, id: "lead-14-project-1", name: "Site institucional", valueInCents: firstValue },
        {
          ...base,
          id: "lead-14-project-2",
          name: "Landing page de campanha",
          valueInCents: deal.closedValueInCents - firstValue,
        },
      ];
    }

    const name = projectNameByNiche[leadById(deal.leadId).niche] ?? "Site institucional";
    return [
      { ...base, id: `${deal.leadId}-project-1`, name, valueInCents: deal.closedValueInCents },
    ];
  });
}
