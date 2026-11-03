import type { LedgerEntry } from "@vetra/contracts";
import {
  BoxIcon,
  CircleCheckIcon,
  ClockIcon,
  HourglassIcon,
  type LucideIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { ActionsMenu } from "@/shared/components/ActionsMenu";
import { BusinessAvatar } from "@/shared/components/BusinessAvatar";
import { Badge } from "@/shared/components/ui/badge";
import { useProfile } from "@/shared/queries/profile/useProfile";
import { cn } from "@/shared/utils/cn";
import { formatChipDate, formatChipDateTime } from "@/shared/utils/date";
import { formatCurrency } from "@/shared/utils/format";

import { useLedgerEntryActions } from "../mutations/useLedgerEntryActions";
import { LedgerEntrySheet } from "./LedgerEntrySheet";

type EntryChipProps = {
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
  children: ReactNode;
};

function EntryChip({ icon: Icon, iconClassName, className, children }: EntryChipProps) {
  return (
    <Badge variant="outline" className={cn("justify-start p-3 font-semibold", className)}>
      <Icon className={cn("shrink-0", iconClassName)} />
      <span className="truncate">{children}</span>
    </Badge>
  );
}

export function LedgerRow({ customerId, entry }: { customerId: string; entry: LedgerEntry }) {
  const [isEditing, setIsEditing] = useState(false);
  const { remove } = useLedgerEntryActions(customerId);
  const { data: profile } = useProfile();
  const isRevenue = entry.type === "revenue";
  const isConfirmed = entry.status === "confirmed";

  return (
    <li className="hover:bg-muted/30 grid grid-cols-[6.5rem_minmax(0,1fr)_auto_auto] items-center px-4 py-2 @4xl:grid-cols-[6.5rem_minmax(0,1fr)_auto_auto_auto]">
      <span
        className={cn(
          "font-semibold tabular-nums",
          isRevenue ? "text-success" : "text-destructive"
        )}
      >
        {isRevenue ? "+" : "−"} {formatCurrency(entry.amountInCents)}
      </span>
      <span className="min-w-0 truncate font-semibold">{entry.description}</span>

      <div className="col-span-3 col-start-2 row-start-2 flex items-center gap-2 @4xl:col-span-1 @4xl:col-start-3 @4xl:row-start-1">
        <EntryChip icon={BoxIcon}>{entry.projectName ?? "Sem projeto"}</EntryChip>
        <EntryChip
          icon={isConfirmed ? CircleCheckIcon : HourglassIcon}
          iconClassName={isConfirmed ? "text-success" : "text-warning"}
        >
          {isConfirmed ? "Confirmado" : "Pendente"}
        </EntryChip>
        <EntryChip icon={ClockIcon}>{formatChipDateTime(new Date(entry.occurredAt))}</EntryChip>
      </div>

      <div className="col-start-3 row-start-1 mr-4 ml-2 flex items-center gap-2 @4xl:col-start-4">
        <BusinessAvatar name={profile?.name ?? ""} className="size-6 text-[10px]" />
        <span
          title="Data em que o registro foi criado"
          className="text-muted-foreground text-xs tabular-nums"
        >
          {formatChipDate(new Date(entry.createdAt))}
        </span>
      </div>

      <div className="col-start-4 row-start-1 @4xl:col-start-5">
        <ActionsMenu
          label="Ações do registro"
          items={[
            { label: "Editar registro", icon: PencilIcon, onSelect: () => setIsEditing(true) },
            {
              label: "Excluir registro",
              icon: Trash2Icon,
              destructive: true,
              onSelect: () => remove(entry),
            },
          ]}
        />
        <LedgerEntrySheet
          customerId={customerId}
          entry={entry}
          open={isEditing}
          onOpenChange={setIsEditing}
        />
      </div>
    </li>
  );
}
