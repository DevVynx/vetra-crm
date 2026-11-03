import { NO_PROJECT_FILTER_VALUE } from "@vetra/contracts";
import {
  BanknoteIcon,
  CalendarIcon,
  CircleCheckIcon,
  FolderKanbanIcon,
  ReceiptTextIcon,
} from "lucide-react";

import type { FilterField, FilterOption } from "@/shared/components/filters/types";

export const buildLedgerFilterFields = (
  projects: FilterOption[],
  isLoadingProjects: boolean
): FilterField[] => [
  {
    id: "type",
    label: "Tipo",
    icon: ReceiptTextIcon,
    type: "select",
    options: [
      { value: "revenue", label: "Receita" },
      { value: "expense", label: "Despesa" },
    ],
  },
  {
    id: "status",
    label: "Situação",
    icon: CircleCheckIcon,
    type: "select",
    options: [
      { value: "confirmed", label: "Confirmado" },
      { value: "pending", label: "Pendente" },
    ],
  },
  {
    id: "project",
    label: "Projeto",
    icon: FolderKanbanIcon,
    type: "select",
    options: [{ value: NO_PROJECT_FILTER_VALUE, label: "Sem projeto" }, ...projects],
    isLoadingOptions: isLoadingProjects,
  },
  { id: "amount", label: "Valor", icon: BanknoteIcon, type: "number", format: "currency" },
  { id: "date", label: "Data", icon: CalendarIcon, type: "date" },
];
