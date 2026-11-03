import type { Stage } from "@vetra/contracts";
import {
  CalendarClockIcon,
  CalendarPlusIcon,
  FunnelIcon,
  MapPinIcon,
  MessageCircleIcon,
  TagIcon,
} from "lucide-react";

import type { FilterField, FilterOption } from "@/shared/components/filters/types";

type LeadFilterOptions = {
  stages: Stage[];
  niches: FilterOption[];
  cities: FilterOption[];
  isLoading: boolean;
};

export const buildLeadFilterFields = ({
  stages,
  niches,
  cities,
  isLoading,
}: LeadFilterOptions): FilterField[] => [
  {
    id: "stage",
    label: "Etapa",
    icon: FunnelIcon,
    type: "select",
    options: stages.map(({ id, name, color }) => ({ value: id, label: name, color })),
  },
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
    id: "next_action",
    label: "Próxima ação",
    icon: CalendarClockIcon,
    type: "boolean",
    labels: { true: "Definida", false: "Sem ação" },
  },
  { id: "last_contact", label: "Último contato", icon: MessageCircleIcon, type: "date" },
  { id: "prospected_at", label: "Prospectado em", icon: CalendarPlusIcon, type: "date" },
];
