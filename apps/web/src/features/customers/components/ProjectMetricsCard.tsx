import type { CustomerDetail } from "@vetra/contracts";
import { FolderKanbanIcon } from "lucide-react";

import { Property, PropertyList } from "@/shared/components/detail/PropertyList";
import { Section } from "@/shared/components/Section";

export function ProjectMetricsCard({ metrics }: { metrics: CustomerDetail["projectMetrics"] }) {
  return (
    <Section title="Métricas" icon={FolderKanbanIcon} iconClassName="text-chart-5">
      <PropertyList>
        <Property label="Projetos" className="tabular-nums">
          {metrics.total}
        </Property>
        <Property label="Em andamento" className="tabular-nums">
          {metrics.active}
        </Property>
        <Property label="Concluídos" className="tabular-nums">
          {metrics.completed}
        </Property>
      </PropertyList>
    </Section>
  );
}
