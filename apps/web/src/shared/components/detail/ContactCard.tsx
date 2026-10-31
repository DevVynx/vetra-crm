import type { LeadDetail } from "@vetra/contracts";
import { ExternalLinkIcon, InfoIcon } from "lucide-react";

import { Section } from "@/shared/components/Section";
import { Button } from "@/shared/components/ui/button";

import { PhoneProperty } from "./PhoneProperty";
import { Property, PropertyList } from "./PropertyList";

type ContactCardProps = {
  lead: LeadDetail;
  title: string;
  document?: string | null;
  showDemo?: boolean;
};

export function ContactCard({ lead, title, document, showDemo = true }: ContactCardProps) {
  return (
    <Section title={title} icon={InfoIcon} iconClassName="text-info">
      <PropertyList>
        <Property label="Telefone">
          <PhoneProperty phone={lead.phone} />
        </Property>
        {document !== undefined && (
          <Property label="Documento">
            {document ?? <span className="text-muted-foreground">Sem documento</span>}
          </Property>
        )}
        <Property label="E-mail">
          {lead.email ? (
            <a href={`mailto:${lead.email}`} className="hover:underline">
              {lead.email}
            </a>
          ) : (
            <span className="text-muted-foreground">Sem e-mail</span>
          )}
        </Property>
        <Property label="Nicho">{lead.niche}</Property>
        <Property label="Cidade">{lead.city}</Property>
        {showDemo && lead.demoUrl && (
          <Property label="Demo">
            <div className="flex items-center gap-1">
              <a href={lead.demoUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {new URL(lead.demoUrl).host}
              </a>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label="Abrir demo"
                title="Abrir demo"
                nativeButton={false}
                render={<a href={lead.demoUrl} target="_blank" rel="noreferrer" />}
              >
                <ExternalLinkIcon />
              </Button>
            </div>
          </Property>
        )}
      </PropertyList>
    </Section>
  );
}
