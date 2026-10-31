import type { LeadStage } from "@vetra/contracts";
import {
  CalendarClockIcon,
  CalendarPlusIcon,
  FunnelIcon,
  MapPinIcon,
  MessageCircleIcon,
  TagIcon,
} from "lucide-react";

import type { FilterField, FilterOption } from "@/shared/components/filters/types";
import { leadStageColor, leadStageLabels } from "@/shared/constants/leadStages";

import { liveStages } from "./leadFilters";

const archivedStages: LeadStage[] = ["no_response", "lost"];

const stageOptions: FilterOption[] = [...liveStages, ...archivedStages].map((stage) => ({
  value: stage,
  label: leadStageLabels[stage],
  color: leadStageColor(stage),
}));

type LeadFilterOptions = {
  niches: FilterOption[];
  cities: FilterOption[];
  isLoading: boolean;
};

export const buildLeadFilterFields = ({
  niches,
  cities,
  isLoading,
}: LeadFilterOptions): FilterField[] => [
  { id: "stage", label: "Etapa", icon: FunnelIcon, type: "select", options: stageOptions },
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
