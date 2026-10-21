import type { ConversationSummary, LeadSummary, NextAction, WonDeal } from "@vetra/contracts";
import { addHours, addMinutes } from "date-fns";

import { inDays } from "../utils/dueDates";

const lead = (
  id: string,
  businessName: string,
  contactName: string | null,
  niche: string,
  city: string,
  stage: LeadSummary["stage"],
  prospectedDaysAgo: number
): LeadSummary => ({
  id,
  businessName,
  contactName,
  niche,
  city,
  stage,
  prospectedAt: inDays(-prospectedDaysAgo).toISOString(),
});

export const mockLeads: LeadSummary[] = [
  lead("lead-1", "Pizzaria Bella Napoli", "Marcos", "Pizzaria", "Ipatinga", "approach_sent", 9),
  lead("lead-2", "Clínica Sorriso", "Dra. Paula", "Dentista", "Coronel Fabriciano", "meeting", 25),
  lead("lead-3", "Barbearia do Zé", "José", "Barbearia", "Timóteo", "conversing", 14),
  lead("lead-4", "Studio Bela Pele", "Maria", "Estética", "Ipatinga", "proposal_sent", 30),
  lead("lead-5", "Auto Center Vale", null, "Automotivo", "Ipatinga", "demo_published", 4),
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
  lead("lead-12", "Lava Jato Brilho", null, "Automotivo", "Ipatinga", "demo_published", 5),
  lead("lead-13", "Restaurante Sabor da Terra", "Helena", "Restaurante", "Ipatinga", "won", 45),
  lead("lead-14", "Ótica Visão Clara", "Roberto", "Ótica", "Coronel Fabriciano", "won", 120),
  lead("lead-15", "Mercearia Dona Rosa", "Rosa", "Mercearia", "Timóteo", "won", 60),
  lead("lead-16", "Padaria Pão Quente", "Sérgio", "Padaria", "Ipatinga", "won", 330),
  lead("lead-17", "Consultório Dr. Almeida", "Dr. Almeida", "Médico", "Ipatinga", "won", 260),
  lead("lead-18", "Floricultura Jardim", "Lúcia", "Floricultura", "Ipaba", "won", 200),
  lead("lead-19", "Escola de Inglês Speak", "Fernanda", "Educação", "Timóteo", "won", 150),
  lead("lead-20", "Oficina Motor Forte", "Paulo", "Automotivo", "Coronel Fabriciano", "won", 85),
];

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
  ];
}

export function buildMockAwaitingConversations(): ConversationSummary[] {
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

// Older, fully paid projects (two installments 30 days apart), so the revenue chart has a
// history to draw over "last 6 months", "this year" and "all time".
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
export const mockProfile = { firstName: "Vinícius" };
