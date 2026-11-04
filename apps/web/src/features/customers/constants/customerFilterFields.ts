import {
  BanknoteIcon,
  FolderKanbanIcon,
  HandshakeIcon,
  MapPinIcon,
  RepeatIcon,
  TagIcon,
} from "lucide-react";

import type { FilterField, FilterOption } from "@/shared/components/filters/types";

type CustomerFilterOptions = {
  niches: FilterOption[];
  cities: FilterOption[];
  isLoading: boolean;
};

export const buildCustomerFilterFields = ({
  niches,
  cities,
  isLoading,
}: CustomerFilterOptions): FilterField[] => [
  {
    id: "niche",
    label: "Nicho",
    icon: TagIcon,
    type: "select",
    options: niches,
    isLoadingOptions: isLoading,
  },
  {
    id: "city",
    label: "Cidade",
    icon: MapPinIcon,
    type: "select",
    options: cities,
    isLoadingOptions: isLoading,
  },
  {
    id: "closed_value",
    label: "Valor fechado",
    icon: BanknoteIcon,
    type: "number",
    format: "currency",
  },
  {
    id: "monthly_fee",
    label: "Mensalidade",
    icon: RepeatIcon,
    type: "boolean",
    labels: { true: "Com mensalidade", false: "Sem mensalidade" },
  },
  {
    id: "active_project",
    label: "Projeto em desenvolvimento",
    icon: FolderKanbanIcon,
    type: "boolean",
    labels: { true: "Sim", false: "Não" },
  },
  { id: "closed_at", label: "Fechado em", icon: HandshakeIcon, type: "date" },
];
