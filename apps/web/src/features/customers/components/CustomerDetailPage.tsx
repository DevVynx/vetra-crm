import { getRouteApi, Navigate } from "@tanstack/react-router";
import type { CustomerProject, Filter } from "@vetra/contracts";
import { FolderKanbanIcon, HandshakeIcon, PlusIcon, WalletIcon } from "lucide-react";
import { useState } from "react";

import { ContactCard } from "@/shared/components/detail/ContactCard";
import { DetailDates } from "@/shared/components/detail/DetailDates";
import { DetailIdentity } from "@/shared/components/detail/DetailIdentity";
import { DetailPanelTrigger } from "@/shared/components/detail/DetailPanelTrigger";
import { DetailNotFound, DetailSkeleton } from "@/shared/components/detail/DetailStates";
import { SplitDetailLayout } from "@/shared/components/detail/SplitDetailLayout";
import { WhatsAppButton } from "@/shared/components/detail/WhatsAppButton";
import { FilterButton } from "@/shared/components/filters/FilterButton";
import { useFilterController } from "@/shared/components/filters/useFilterController";
import { usePageCrumb } from "@/shared/components/layout/PageCrumb";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useHotkey } from "@/shared/hooks/useHotkey";
import { useLead } from "@/shared/queries/leads/useLead";
import { pluralize } from "@/shared/utils/format";

import { buildLedgerFilterFields } from "../constants/ledgerFilterFields";
import { useCustomer } from "../queries/useCustomer";
import { useCustomerLedger } from "../queries/useCustomerLedger";
import { useCustomerProjects } from "../queries/useCustomerProjects";
import { BillingCard } from "./BillingCard";
import { CustomerActionsMenu } from "./CustomerActionsMenu";
import { FinancialTab } from "./FinancialTab";
import { LedgerEntrySheet } from "./LedgerEntrySheet";
import { ProjectMetricsCard } from "./ProjectMetricsCard";
import { ProjectSheet } from "./ProjectSheet";
import { ProjectsTab } from "./ProjectsTab";

const route = getRouteApi("/_app/customers/$customerId");

type CustomerTab = "financial" | "projects";

const NO_FILTERS: Filter[] = [];

export function CustomerDetailPage() {
  const { customerId } = route.useParams();
  const { filters = NO_FILTERS } = route.useSearch();
  const navigate = route.useNavigate();
  const { data: customer, isPending, isError } = useCustomer(customerId);
  // Only asked when the customer is missing: the record may be a lead that has not closed yet.
  const lead = useLead(customerId, { enabled: isError });
  const [tab, setTab] = useState<CustomerTab>("financial");
  const [isCreating, setIsCreating] = useState(false);
  useHotkey("n", () => setIsCreating(true), Boolean(customer));
  const ledger = useCustomerLedger(customerId, filters);
  const projects = useCustomerProjects(customerId);

  const filtering = useFilterController({
    fields:
      tab === "financial"
        ? buildLedgerFilterFields(
            (projects.data?.projects ?? []).map((project) => ({
              value: project.id,
              label: project.name,
            })),
            projects.isPending
          )
        : [],
    value: filters,
    onChange: (next) =>
      navigate({
        search: (previous) => ({ ...previous, filters: next.length > 0 ? next : undefined }),
      }),
  });
  usePageCrumb(customer?.businessName);

  const showProjectEntries = (project: CustomerProject) => {
    setTab("financial");
    navigate({
      search: (previous) => ({
        ...previous,
        filters: [{ field: "project", operator: "is", values: [project.id] }],
      }),
    });
  };

  if (isPending || (isError && lead.isPending)) return <DetailSkeleton />;

  if (!customer) {
    if (lead.data) return <Navigate to="/leads/$leadId" params={{ leadId: customerId }} replace />;

    return (
      <DetailNotFound
        icon={HandshakeIcon}
        title="Cliente não encontrado"
        backTo="/customers"
        backLabel="Voltar para Clientes"
      />
    );
  }

  const countLabel =
    tab === "financial"
      ? pluralize(ledger.data?.entries.length ?? 0, "lançamento", "lançamentos")
      : pluralize(projects.data?.projects.length ?? 0, "projeto", "projetos");

  return (
    <SplitDetailLayout
      storageKey="customer-detail-panel-open"
      aside={
        <>
          <DetailIdentity
            kind="Cliente"
            name={customer.businessName}
            contactName={customer.contactName}
            actions={<CustomerActionsMenu customer={customer} />}
          />
          <ContactCard
            lead={customer}
            title="Informações"
            document={customer.document}
            showDemo={false}
          />
          <BillingCard billing={customer.billing} />
          <ProjectMetricsCard metrics={customer.projectMetrics} />
        </>
      }
      footer={
        <DetailDates
          className="border-t-0 pt-0"
          rows={[
            { kind: "created", date: customer.createdAt },
            { kind: "updated", date: customer.updatedAt },
          ]}
        />
      }
    >
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value === "projects" ? "projects" : "financial")}
        className="gap-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <DetailPanelTrigger label="dados do cliente" />
          <TabsList>
            <TabsTrigger value="financial" className="gap-1.5 px-3">
              <WalletIcon />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-1.5 px-3">
              <FolderKanbanIcon />
              Projetos
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex gap-2">
            <WhatsAppButton />
            {tab === "financial" && <FilterButton controller={filtering} />}
            <Button
              className="font-semibold"
              title={`${tab === "financial" ? "Novo registro" : "Novo projeto"} (N)`}
              onClick={() => setIsCreating(true)}
            >
              <PlusIcon />
              {tab === "financial" ? "Novo registro" : "Novo projeto"}
            </Button>
          </div>
        </div>
        <LedgerEntrySheet
          customerId={customer.id}
          open={isCreating && tab === "financial"}
          onOpenChange={setIsCreating}
        />
        <ProjectSheet
          customerId={customer.id}
          open={isCreating && tab === "projects"}
          onOpenChange={setIsCreating}
        />
        <p className="text-muted-foreground text-sm">{countLabel}</p>
        <TabsContent value="financial">
          <FinancialTab customer={customer} filtering={filtering} />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsTab customerId={customer.id} onViewEntries={showProjectEntries} />
        </TabsContent>
      </Tabs>
    </SplitDetailLayout>
  );
}
