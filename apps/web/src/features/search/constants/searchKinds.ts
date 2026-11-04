import type { UseNavigateResult } from "@tanstack/react-router";
import type { SearchKind } from "@vetra/contracts";
import {
  CalendarClockIcon,
  FolderKanbanIcon,
  HandshakeIcon,
  type LucideIcon,
  StickyNoteIcon,
  UsersIcon,
} from "lucide-react";

type Navigate = UseNavigateResult<string>;

type SearchKindView = {
  title: string;
  icon: LucideIcon;
  open: (navigate: Navigate, targetId: string) => void;
};

const openLead = (navigate: Navigate, leadId: string) =>
  navigate({ to: "/leads/$leadId", params: { leadId } });

const openCustomer = (navigate: Navigate, customerId: string) =>
  navigate({ to: "/customers/$customerId", params: { customerId } });

// A new searchable kind is one more entry here and one more group on the server.
export const searchKinds: Record<SearchKind, SearchKindView> = {
  leads: { title: "Leads", icon: UsersIcon, open: openLead },
  customers: { title: "Clientes", icon: HandshakeIcon, open: openCustomer },
  projects: { title: "Projetos", icon: FolderKanbanIcon, open: openCustomer },
  notes: { title: "Notas", icon: StickyNoteIcon, open: openLead },
  next_actions: { title: "Próximas ações", icon: CalendarClockIcon, open: openLead },
};
