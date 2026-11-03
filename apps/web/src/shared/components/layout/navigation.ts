import { HandshakeIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon } from "lucide-react";
import type { ComponentType } from "react";

import { WhatsAppIcon } from "@/shared/components/icons/WhatsAppIcon";

export type NavigationItem = {
  title: string;
  to: "/" | "/leads" | "/customers" | "/whatsapp" | "/settings";
  icon: ComponentType<{ className?: string }>;
};

export const mainNavigation: NavigationItem[] = [
  { title: "Painel", to: "/", icon: LayoutDashboardIcon },
  { title: "Leads", to: "/leads", icon: UsersIcon },
  { title: "Clientes", to: "/customers", icon: HandshakeIcon },
  { title: "WhatsApp", to: "/whatsapp", icon: WhatsAppIcon },
];

export const footerNavigation: NavigationItem[] = [
  { title: "Configurações", to: "/settings", icon: SettingsIcon },
];
