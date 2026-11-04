import type { LeadSortField } from "@vetra/contracts";
import {
  Building2Icon,
  CalendarClockIcon,
  CalendarPlusIcon,
  MapPinIcon,
  MessageCircleIcon,
  TagIcon,
} from "lucide-react";

import type { SortOption } from "@/shared/components/sort/types";

export const DEFAULT_LEAD_SORT_FIELD: LeadSortField = "next_action";

export const leadSortOptions: SortOption<LeadSortField>[] = [
  { id: "next_action", label: "Próxima ação", icon: CalendarClockIcon, defaultDirection: "asc" },
  {
    id: "prospected_at",
    label: "Data de prospecção",
    icon: CalendarPlusIcon,
    defaultDirection: "desc",
  },
  {
    id: "last_contact",
    label: "Último contato",
    icon: MessageCircleIcon,
    defaultDirection: "desc",
  },
  { id: "business_name", label: "Nome do negócio", icon: Building2Icon, defaultDirection: "asc" },
  { id: "niche", label: "Nicho", icon: TagIcon, defaultDirection: "asc" },
  { id: "city", label: "Cidade", icon: MapPinIcon, defaultDirection: "asc" },
];
