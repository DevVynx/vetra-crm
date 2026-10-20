import { CalendarCheckIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon } from "lucide-react";
import type { ComponentType } from "react";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";

export type NavigationItem = {
  title: string;
  to: "/" | "/leads" | "/whatsapp" | "/dashboard" | "/configuracoes";
  icon: ComponentType<{ className?: string }>;
};

export const mainNavigation: NavigationItem[] = [
  { title: "Hoje", to: "/", icon: CalendarCheckIcon },
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Leads", to: "/leads", icon: UsersIcon },
  { title: "WhatsApp", to: "/whatsapp", icon: WhatsAppIcon },
];

export const footerNavigation: NavigationItem[] = [
  { title: "Configurações", to: "/configuracoes", icon: SettingsIcon },
];
