import { FolderKanbanIcon } from "lucide-react";

import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatShortDate } from "@/shared/utils/date";
import { formatCurrency } from "@/shared/utils/format";

import { useCustomerProjects } from "../queries/useCustomerProjects";
import { StatusBadge } from "./StatusBadge";

export function ProjectsTab({ customerId }: { customerId: string }) {
  const { data, isPending } = useCustomerProjects(customerId);
  const projects = data?.projects ?? [];

  if (isPending) return <SectionSkeleton rows={2} />;
  if (projects.length === 0) {
    return <SectionEmpty icon={FolderKanbanIcon} title="Nenhum projeto" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="hidden md:table-cell">Início</TableHead>
              <TableHead className="hidden md:table-cell">Entrega</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={project.status === "in_production" ? "Em andamento" : "Entregue"}
                    dotClassName={project.status === "in_production" ? "bg-info" : "bg-success"}
                  />
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatCurrency(project.valueInCents)}
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  {formatShortDate(new Date(project.startedAt))}
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  {project.deliveredAt ? formatShortDate(new Date(project.deliveredAt)) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
