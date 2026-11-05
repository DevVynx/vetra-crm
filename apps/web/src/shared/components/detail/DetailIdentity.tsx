import type { ReactNode } from "react";

import { BusinessAvatar } from "@/shared/components/BusinessAvatar";

type DetailIdentityProps = {
  kind: "Lead" | "Cliente";
  name: string;
  contactName: string | null;
  photoUrl: string | null;
  status?: ReactNode;
  actions?: ReactNode;
};

export function DetailIdentity({
  kind,
  name,
  contactName,
  photoUrl,
  status,
  actions,
}: DetailIdentityProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <BusinessAvatar name={name} photoUrl={photoUrl ?? undefined} className="size-16 text-xl" />
        {actions}
      </div>
      <div>
        <p className="text-muted-foreground text-sm">{kind}</p>
        <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
        {contactName && <p className="text-muted-foreground text-sm">{contactName}</p>}
        {status && <p className="text-muted-foreground mt-1 text-xs">{status}</p>}
      </div>
    </div>
  );
}
