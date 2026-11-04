import type { CustomerSortField } from "@vetra/contracts";
import {
  BanknoteIcon,
  Building2Icon,
  HandshakeIcon,
  MapPinIcon,
  RepeatIcon,
  TagIcon,
  WalletIcon,
} from "lucide-react";

import type { SortOption } from "@/shared/components/sort/types";

export const DEFAULT_CUSTOMER_SORT_FIELD: CustomerSortField = "closed_at";

export const customerSortOptions: SortOption<CustomerSortField>[] = [
  { id: "closed_at", label: "Data de fechamento", icon: HandshakeIcon, defaultDirection: "desc" },
  { id: "closed_value", label: "Valor fechado", icon: BanknoteIcon, defaultDirection: "desc" },
  { id: "received", label: "Valor recebido", icon: WalletIcon, defaultDirection: "desc" },
  { id: "monthly_fee", label: "Mensalidade", icon: RepeatIcon, defaultDirection: "desc" },
  { id: "business_name", label: "Nome do negócio", icon: Building2Icon, defaultDirection: "asc" },
  { id: "niche", label: "Nicho", icon: TagIcon, defaultDirection: "asc" },
  { id: "city", label: "Cidade", icon: MapPinIcon, defaultDirection: "asc" },
];
