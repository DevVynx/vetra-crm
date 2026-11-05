// Development only: wipes every lead (and, by cascade, all customer data, notes and actions) and
// fills the database with realistic demo data spread over the last months, so every screen and
// every Painel period has something to show. Stages and profile are kept: the API creates them
// on startup, and the seed places leads in whatever stages exist, by role and position.
import { v7 as uuidv7 } from "uuid";

import { db } from "./index";
import {
  dealsTable,
  expensesTable,
  installmentsTable,
  leadNotesTable,
  leadsTable,
  nextActionsTable,
  projectsTable,
  stagesTable,
} from "./schema";

type Stage = typeof stagesTable.$inferSelect;
type LeadRow = typeof leadsTable.$inferInsert;
type InstallmentRow = typeof installmentsTable.$inferInsert;
type ExpenseRow = typeof expensesTable.$inferInsert;
type ProjectRow = typeof projectsTable.$inferInsert;
type NextActionRow = typeof nextActionsTable.$inferInsert;
type NoteRow = typeof leadNotesTable.$inferInsert;

const DAY_IN_MS = 86_400_000;

// An instant `days` from now at the given UTC hour (15h UTC is midday in Brazil; 3h UTC is
// local midnight, which is how due dates arrive from the date picker).
function at(days: number, utcHour = 15): Date {
  const date = new Date(Date.now() + days * DAY_IN_MS);
  date.setUTCHours(utcHour, 0, 0, 0);
  return date;
}

// Fractions of a day are taken as exactly that long ago, so "today" never lands in the future.
const ago = (days: number) => (days < 1 ? new Date(Date.now() - days * DAY_IN_MS) : at(-days));

const slug = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

let phoneSequence = 0;
const nextPhone = () => `55319${String(88_000_000 + phoneSequence++ * 7_919).padStart(8, "0")}`;

type LeadSpec = {
  businessName: string;
  contactName: string | null;
  niche: string;
  city: string;
  stage: Stage;
  stoppedAt?: Stage;
  prospectedDaysAgo: number;
  stageChangedDaysAgo?: number;
  lastContactDaysAgo?: number;
};

// Same rule as canonicalPhoneOf in packages/core, which this package cannot import.
const phoneKeyOf = (phone: string) => phone.replace(/^55(\d{2})9(\d{8})$/, "55$1$2");

function leadFrom(spec: LeadSpec): LeadRow {
  const prospectedAt = at(-spec.prospectedDaysAgo, 13);
  const phone = nextPhone();
  const isEntry = spec.stage.role === "entry";
  return {
    id: uuidv7(),
    businessName: spec.businessName,
    contactName: spec.contactName,
    niche: spec.niche,
    city: spec.city,
    phone,
    phoneKey: phoneKeyOf(phone),
    email: spec.contactName
      ? `${slug(spec.contactName.split(" ")[0] ?? "contato")}@${slug(spec.businessName)}.com.br`
      : null,
    demoUrl: isEntry ? null : `https://${slug(spec.businessName)}.vercel.app`,
    stageId: spec.stage.id,
    stoppedAtStageId: spec.stoppedAt?.id ?? null,
    stageChangedAt: ago(spec.stageChangedDaysAgo ?? spec.prospectedDaysAgo),
    prospectedAt,
    lastContactAt: spec.lastContactDaysAgo === undefined ? null : at(-spec.lastContactDaysAgo, 16),
    createdAt: prospectedAt,
  };
}

async function loadStages() {
  const stages = await db.select().from(stagesTable);
  const byPosition = (a: Stage, b: Stage) => a.position - b.position;
  const entry = stages.find((stage) => stage.role === "entry");
  const closing = stages.find((stage) => stage.role === "closing");
  const middles = stages.filter((stage) => stage.role === "middle").sort(byPosition);
  const archives = stages.filter((stage) => stage.role === "archive").sort(byPosition);

  if (!entry || !closing || middles.length === 0 || archives.length === 0) {
    throw new Error("No stages found: start the API once so it creates the default stages.");
  }
  // Fewer custom stages than the preset still work: indexes wrap around.
  const middle = (index: number) => middles[index % middles.length] as Stage;
  const archive = (index: number) => archives[index % archives.length] as Stage;
  return { entry, closing, middle, archive };
}

async function seed() {
  const { entry, closing, middle, archive } = await loadStages();

  // --- Leads still in the funnel or archived -------------------------------------------------
  const leadSpecs: LeadSpec[] = [
    {
      businessName: "Padaria Trigo de Ouro",
      contactName: "Marcos Lima",
      niche: "Padaria",
      city: "Belo Horizonte",
      stage: entry,
      prospectedDaysAgo: 1,
    },
    {
      businessName: "Barbearia Navalha Fina",
      contactName: "Diego Rocha",
      niche: "Barbearia",
      city: "Contagem",
      stage: entry,
      prospectedDaysAgo: 2,
    },
    {
      businessName: "Studio Pilates Equilíbrio",
      contactName: null,
      niche: "Academia",
      city: "Nova Lima",
      stage: entry,
      prospectedDaysAgo: 4,
    },
    {
      businessName: "Pet Shop Patinhas",
      contactName: "Renata Alves",
      niche: "Pet shop",
      city: "Betim",
      stage: entry,
      prospectedDaysAgo: 6,
    },
    {
      businessName: "Restaurante Sabor Mineiro",
      contactName: "Paulo Mendes",
      niche: "Restaurante",
      city: "Belo Horizonte",
      stage: entry,
      prospectedDaysAgo: 9,
    },
    {
      businessName: "Salão Bella Donna",
      contactName: "Carla Souza",
      niche: "Salão de beleza",
      city: "Contagem",
      stage: middle(0),
      prospectedDaysAgo: 12,
      stageChangedDaysAgo: 10,
      lastContactDaysAgo: 10,
    },
    {
      businessName: "Oficina Pit Stop",
      contactName: "Rogério Dias",
      niche: "Oficina",
      city: "Betim",
      stage: middle(0),
      prospectedDaysAgo: 18,
      stageChangedDaysAgo: 15,
      lastContactDaysAgo: 15,
    },
    {
      businessName: "Clínica Vida Plena",
      contactName: "Fernanda Castro",
      niche: "Odontologia",
      city: "Belo Horizonte",
      stage: middle(0),
      prospectedDaysAgo: 25,
      stageChangedDaysAgo: 22,
      lastContactDaysAgo: 8,
    },
    {
      businessName: "Açougue Boi Gordo",
      contactName: null,
      niche: "Restaurante",
      city: "Nova Lima",
      stage: middle(0),
      prospectedDaysAgo: 40,
      stageChangedDaysAgo: 38,
      lastContactDaysAgo: 30,
    },
    {
      businessName: "Academia Corpo em Forma",
      contactName: "Thiago Nunes",
      niche: "Academia",
      city: "Belo Horizonte",
      stage: middle(1),
      prospectedDaysAgo: 30,
      stageChangedDaysAgo: 5,
      lastContactDaysAgo: 2,
    },
    {
      businessName: "Barbearia Dom Bigode",
      contactName: "Lucas Prado",
      niche: "Barbearia",
      city: "Belo Horizonte",
      stage: middle(1),
      prospectedDaysAgo: 55,
      stageChangedDaysAgo: 20,
      lastContactDaysAgo: 3,
    },
    {
      businessName: "Pet Center Bicho Feliz",
      contactName: "Juliana Reis",
      niche: "Pet shop",
      city: "Contagem",
      stage: middle(1),
      prospectedDaysAgo: 70,
      stageChangedDaysAgo: 30,
      lastContactDaysAgo: 6,
    },
    {
      businessName: "Odonto Sorriso Kids",
      contactName: "Beatriz Melo",
      niche: "Odontologia",
      city: "Nova Lima",
      stage: middle(2),
      prospectedDaysAgo: 45,
      stageChangedDaysAgo: 4,
      lastContactDaysAgo: 1,
    },
    {
      businessName: "Confeitaria Doce Encanto",
      contactName: "Aline Freitas",
      niche: "Padaria",
      city: "Betim",
      stage: middle(2),
      prospectedDaysAgo: 90,
      stageChangedDaysAgo: 12,
      lastContactDaysAgo: 4,
    },
    {
      businessName: "Auto Center Rota 40",
      contactName: "Eduardo Pires",
      niche: "Oficina",
      city: "Contagem",
      stage: middle(3),
      prospectedDaysAgo: 60,
      stageChangedDaysAgo: 3,
      lastContactDaysAgo: 0,
    },
    {
      businessName: "Espaço Beleza Pura",
      contactName: "Patrícia Gomes",
      niche: "Salão de beleza",
      city: "Belo Horizonte",
      stage: middle(3),
      prospectedDaysAgo: 120,
      stageChangedDaysAgo: 7,
      lastContactDaysAgo: 2,
    },
    {
      businessName: "Pizzaria Forno a Lenha",
      contactName: "Gustavo Ramos",
      niche: "Restaurante",
      city: "Betim",
      stage: archive(0),
      stoppedAt: middle(0),
      prospectedDaysAgo: 150,
      stageChangedDaysAgo: 100,
      lastContactDaysAgo: 110,
    },
    {
      businessName: "Academia Iron Gym",
      contactName: null,
      niche: "Academia",
      city: "Contagem",
      stage: archive(0),
      stoppedAt: middle(1),
      prospectedDaysAgo: 200,
      stageChangedDaysAgo: 160,
      lastContactDaysAgo: 170,
    },
    {
      businessName: "Clínica Dental Prime",
      contactName: "Rafael Costa",
      niche: "Odontologia",
      city: "Belo Horizonte",
      stage: archive(1),
      stoppedAt: middle(3),
      prospectedDaysAgo: 180,
      stageChangedDaysAgo: 90,
      lastContactDaysAgo: 95,
    },
    {
      businessName: "Mercado Bom Preço",
      contactName: "Sônia Araújo",
      niche: "Padaria",
      city: "Nova Lima",
      stage: archive(1),
      stoppedAt: middle(2),
      prospectedDaysAgo: 240,
      stageChangedDaysAgo: 130,
      lastContactDaysAgo: 135,
    },
  ];
  const leads = leadSpecs.map(leadFrom);
  const leadNamed = (name: string) => {
    const lead = leads.find((item) => item.businessName === name);
    if (!lead?.id) throw new Error(`Seed lead ${name} is missing`);
    return lead.id;
  };

  // --- Customers: leads in the closing stage, each with a deal ------------------------------
  const customerSpecs: (LeadSpec & {
    closedDaysAgo: number;
    closedValueInCents: number;
    monthlyFeeInCents: number | null;
    document: string | null;
  })[] = [
    {
      businessName: "Clínica Sorriso Leve",
      contactName: "Helena Martins",
      niche: "Odontologia",
      city: "Belo Horizonte",
      stage: closing,
      prospectedDaysAgo: 300,
      lastContactDaysAgo: 12,
      closedDaysAgo: 270,
      closedValueInCents: 600_000,
      monthlyFeeInCents: 15_000,
      document: "12.345.678/0001-90",
    },
    {
      businessName: "Academia Força Total",
      contactName: "Bruno Teixeira",
      niche: "Academia",
      city: "Contagem",
      stage: closing,
      prospectedDaysAgo: 180,
      lastContactDaysAgo: 20,
      closedDaysAgo: 150,
      closedValueInCents: 480_000,
      monthlyFeeInCents: 12_000,
      document: "23.456.789/0001-01",
    },
    {
      businessName: "Padaria Pão Dourado",
      contactName: "Sérgio Faria",
      niche: "Padaria",
      city: "Belo Horizonte",
      stage: closing,
      prospectedDaysAgo: 80,
      lastContactDaysAgo: 5,
      closedDaysAgo: 60,
      closedValueInCents: 300_000,
      monthlyFeeInCents: null,
      document: null,
    },
    {
      businessName: "Pet Shop Amigo Fiel",
      contactName: "Larissa Moura",
      niche: "Pet shop",
      city: "Betim",
      stage: closing,
      prospectedDaysAgo: 35,
      lastContactDaysAgo: 3,
      closedDaysAgo: 20,
      closedValueInCents: 240_000,
      monthlyFeeInCents: null,
      document: "345.678.901-23",
    },
    {
      businessName: "Oficina Motor Bom",
      contactName: "Antônio Silva",
      niche: "Oficina",
      city: "Contagem",
      stage: closing,
      prospectedDaysAgo: 15,
      lastContactDaysAgo: 1,
      closedDaysAgo: 0.1,
      closedValueInCents: 500_000,
      monthlyFeeInCents: null,
      document: null,
    },
  ];
  const customers = customerSpecs.map((spec) => ({
    ...spec,
    lead: leadFrom({ ...spec, stageChangedDaysAgo: spec.closedDaysAgo }),
  }));
  const deals = customers.map((customer) => ({
    id: uuidv7(),
    leadId: customer.lead.id as string,
    closedAt: ago(customer.closedDaysAgo),
    closedValueInCents: customer.closedValueInCents,
    document: customer.document,
    monthlyFeeInCents: customer.monthlyFeeInCents,
  }));
  const [sorriso, forca, paoDourado, amigoFiel, motorBom] = customers.map(
    (customer) => customer.lead.id as string
  ) as [string, string, string, string, string];
  const closedAgo = (index: number) => customerSpecs[index]?.closedDaysAgo ?? 0;

  // --- Projects --------------------------------------------------------------------------------
  const project = (
    leadId: string,
    name: string,
    valueInCents: number,
    startedDaysAgo: number,
    deliveredDaysAgo: number | null
  ): ProjectRow => ({
    id: uuidv7(),
    leadId,
    name,
    status: deliveredDaysAgo === null ? "in_production" : "delivered",
    valueInCents,
    startedAt: at(-startedDaysAgo, 12),
    deliveredAt: deliveredDaysAgo === null ? null : at(-deliveredDaysAgo, 18),
  });
  const projects = [
    project(sorriso, "Site institucional", 450_000, 265, 220),
    project(sorriso, "Landing page de implantes", 150_000, 40, null),
    project(forca, "App de treinos", 480_000, 145, null),
    project(paoDourado, "Cardápio digital", 300_000, 58, 20),
    project(amigoFiel, "Loja virtual", 240_000, 18, null),
    project(motorBom, "Sistema de agendamento", 500_000, 2, null),
  ];
  const projectNamed = (name: string) => projects.find((item) => item.name === name)?.id ?? null;

  // --- Installments: the same shapes the closing flow creates ---------------------------------
  const installment = (
    leadId: string,
    description: string,
    amountInCents: number,
    dueDaysAgo: number,
    paidDaysAgo: number | null,
    projectId: string | null = null
  ): InstallmentRow => ({
    id: uuidv7(),
    leadId,
    projectId,
    description,
    amountInCents,
    dueAt: dueDaysAgo < 1 && dueDaysAgo >= 0 ? ago(dueDaysAgo) : at(-dueDaysAgo, 3),
    paidAt: paidDaysAgo === null ? null : ago(paidDaysAgo),
    createdAt: at(-Math.max(dueDaysAgo, 0), 17),
  });
  const installments = [
    // Paid in full at closing.
    installment(
      sorriso,
      "Pagamento à vista",
      600_000,
      closedAgo(0),
      closedAgo(0),
      projectNamed("Site institucional")
    ),
    // Down payment plus three monthly installments, all paid.
    installment(
      forca,
      "Entrada",
      120_000,
      closedAgo(1),
      closedAgo(1),
      projectNamed("App de treinos")
    ),
    installment(forca, "Parcela 1 de 3", 120_000, 120, 119, projectNamed("App de treinos")),
    installment(forca, "Parcela 2 de 3", 120_000, 90, 88, projectNamed("App de treinos")),
    installment(forca, "Parcela 3 de 3", 120_000, 60, 60, projectNamed("App de treinos")),
    // Down payment plus four installments: one paid, one overdue, two ahead.
    installment(paoDourado, "Entrada", 100_000, closedAgo(2), closedAgo(2)),
    installment(paoDourado, "Parcela 1 de 4", 50_000, 30, 29, projectNamed("Cardápio digital")),
    installment(paoDourado, "Parcela 2 de 4", 50_000, 1, null, projectNamed("Cardápio digital")),
    installment(paoDourado, "Parcela 3 de 4", 50_000, -29, null),
    installment(paoDourado, "Parcela 4 de 4", 50_000, -59, null),
    // Installments only: the first paid, the rest ahead.
    installment(amigoFiel, "Parcela 1 de 3", 80_000, 10, 9, projectNamed("Loja virtual")),
    installment(amigoFiel, "Parcela 2 de 3", 80_000, -20, null, projectNamed("Loja virtual")),
    installment(amigoFiel, "Parcela 3 de 3", 80_000, -50, null, projectNamed("Loja virtual")),
    // Down payment; the rest has no installments yet (billed through the closed value).
    installment(motorBom, "Entrada", 200_000, closedAgo(4), closedAgo(4)),
    // A revenue registered by hand on the ledger.
    installment(sorriso, "Ajustes no site", 35_000, 45, 44, projectNamed("Site institucional")),
  ];

  // --- Expenses ---------------------------------------------------------------------------------
  const expense = (
    leadId: string,
    description: string,
    amountInCents: number,
    daysAgo: number,
    status: "confirmed" | "pending",
    projectId: string | null = null
  ): ExpenseRow => ({
    id: uuidv7(),
    leadId,
    projectId,
    description,
    amountInCents,
    status,
    occurredAt: at(-daysAgo, 15),
    createdAt: at(-Math.max(daysAgo, 0), 15),
  });
  const expenses = [
    expense(
      sorriso,
      "Hospedagem anual",
      36_000,
      260,
      "confirmed",
      projectNamed("Site institucional")
    ),
    expense(
      sorriso,
      "Domínio .com.br",
      4_000,
      260,
      "confirmed",
      projectNamed("Site institucional")
    ),
    expense(
      forca,
      "Conta de desenvolvedor da loja de apps",
      12_500,
      140,
      "confirmed",
      projectNamed("App de treinos")
    ),
    expense(
      paoDourado,
      "Fotos dos produtos",
      25_000,
      50,
      "confirmed",
      projectNamed("Cardápio digital")
    ),
    expense(
      amigoFiel,
      "Tema da loja virtual",
      18_000,
      15,
      "confirmed",
      projectNamed("Loja virtual")
    ),
    expense(amigoFiel, "Plugin de pagamentos", 9_000, -10, "pending", projectNamed("Loja virtual")),
    expense(motorBom, "Servidor do sistema", 15_000, -5, "pending"),
  ];

  // --- Next actions: overdue, due today and ahead ---------------------------------------------
  const nextAction = (
    leadName: string,
    type: NextActionRow["type"],
    description: string,
    dueInDays: number,
    followUpStep: number | null = null,
    utcHour = 13
  ): NextActionRow => ({
    id: uuidv7(),
    leadId: leadNamed(leadName),
    type,
    followUpStep,
    description,
    dueAt: at(dueInDays, utcHour),
  });
  const nextActions = [
    nextAction(
      "Padaria Trigo de Ouro",
      "first_approach",
      "Enviar a primeira abordagem",
      0,
      null,
      23
    ),
    nextAction("Barbearia Navalha Fina", "first_approach", "Enviar a primeira abordagem", 1),
    nextAction("Pet Shop Patinhas", "first_approach", "Enviar a primeira abordagem", -2),
    nextAction("Salão Bella Donna", "follow_up", "Perguntar se viu a demo", -1, 1),
    nextAction("Oficina Pit Stop", "follow_up", "Segundo follow-up", 0, 2, 22),
    nextAction("Academia Corpo em Forma", "follow_up", "Retomar a conversa", 2, 1),
    nextAction("Odonto Sorriso Kids", "meeting", "Reunião para apresentar o site", 3),
    nextAction("Confeitaria Doce Encanto", "meeting", "Confirmar a reunião de quinta", -3),
    nextAction("Auto Center Rota 40", "proposal", "Cobrar resposta da proposta", 0, null, 20),
    nextAction("Espaço Beleza Pura", "proposal", "Ajustar a proposta com desconto", 5),
  ];

  // --- Notes --------------------------------------------------------------------------------
  const note = (leadId: string, content: string, daysAgo: number): NoteRow => ({
    id: uuidv7(),
    leadId,
    content,
    createdAt: at(-daysAgo, 18),
  });
  const notes = [
    note(
      leadNamed("Academia Corpo em Forma"),
      "Gostou da demo, mas quer ver o preço com o sócio.",
      5
    ),
    note(leadNamed("Academia Corpo em Forma"), "Prefere falar depois das 18h.", 2),
    note(leadNamed("Odonto Sorriso Kids"), "Pediu um exemplo de site de outra clínica.", 4),
    note(leadNamed("Auto Center Rota 40"), "Proposta de R$ 3.500 enviada por e-mail.", 3),
    note(leadNamed("Pizzaria Forno a Lenha"), "Já tem um site feito pelo sobrinho.", 100),
    note(sorriso, "Renova a hospedagem todo ano em março.", 200),
    note(paoDourado, "Parcela 2 atrasada: combinou pagar na sexta.", 1),
  ];

  await db.transaction(async (tx) => {
    await tx.delete(leadsTable);
    await tx.insert(leadsTable).values([...leads, ...customers.map((customer) => customer.lead)]);
    await tx.insert(dealsTable).values(deals);
    await tx.insert(projectsTable).values(projects);
    await tx.insert(installmentsTable).values(installments);
    await tx.insert(expensesTable).values(expenses);
    await tx.insert(nextActionsTable).values(nextActions);
    await tx.insert(leadNotesTable).values(notes);
  });

  console.log(
    `Seed concluído: ${leads.length} leads, ${customers.length} clientes, ${projects.length} projetos, ` +
      `${installments.length} parcelas, ${expenses.length} despesas, ${nextActions.length} próximas ações, ` +
      `${notes.length} notas.`
  );
}

await seed();
await db.$client.end();
