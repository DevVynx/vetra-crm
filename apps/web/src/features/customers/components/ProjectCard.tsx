import type { CustomerProject } from "@vetra/contracts";
import {
  CircleCheckBigIcon,
  FolderKanbanIcon,
  PencilIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

import { ActionsMenu } from "@/shared/components/ActionsMenu";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import { formatShortDate } from "@/shared/utils/date";
import { formatCurrency, pluralize } from "@/shared/utils/format";

import {
  toProjectRequest,
  useCustomerProjectActions,
} from "../mutations/useCustomerProjectActions";
import { ProjectSheet } from "./ProjectSheet";
import { StatusBadge } from "./StatusBadge";

type ProjectCardProps = {
  customerId: string;
  project: CustomerProject;
  onViewEntries: (project: CustomerProject) => void;
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="truncate text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export function ProjectCard({ customerId, project, onViewEntries }: ProjectCardProps) {
  const { update, remove, isRemoving } = useCustomerProjectActions(customerId);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDelivered = project.status === "delivered";
  const { receivedInCents, pendingInCents, expensesInCents, linkedEntriesCount } =
    project.financial;
  const receivedShare = Math.min(100, (receivedInCents / project.valueInCents) * 100);

  const toggleDelivered = () =>
    update(
      project,
      { ...toProjectRequest(project), status: isDelivered ? "in_production" : "delivered" },
      isDelivered ? "Projeto reaberto com sucesso." : "Projeto marcado como entregue."
    );

  return (
    <article className="bg-card flex flex-col gap-5 rounded-xl border p-5">
      <header className="flex items-start gap-3">
        <div className="bg-foreground/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
          <FolderKanbanIcon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="truncate text-base leading-tight font-semibold">{project.name}</h3>
          <div>
            <StatusBadge
              label={isDelivered ? "Entregue" : "Em desenvolvimento"}
              dotClassName={isDelivered ? "bg-success" : "bg-info"}
            />
          </div>
        </div>
        <ActionsMenu
          label="Ações do projeto"
          items={[
            { label: "Editar projeto", icon: PencilIcon, onSelect: () => setIsEditing(true) },
            {
              label: isDelivered ? "Reabrir projeto" : "Marcar como entregue",
              icon: isDelivered ? RotateCcwIcon : CircleCheckBigIcon,
              onSelect: toggleDelivered,
            },
            {
              label: "Excluir projeto",
              icon: Trash2Icon,
              destructive: true,
              onSelect: () => setIsDeleting(true),
            },
          ]}
        />
      </header>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(project.valueInCents)}
          </span>
          <span className="text-muted-foreground text-xs">valor do projeto</span>
        </div>
        <div
          className="bg-muted h-1.5 overflow-hidden rounded-full"
          role="img"
          aria-label={`${formatCurrency(receivedInCents)} recebidos de ${formatCurrency(project.valueInCents)}`}
        >
          <div className="bg-success h-full rounded-full" style={{ width: `${receivedShare}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Recebido" value={formatCurrency(receivedInCents)} />
        <Metric label="A receber" value={formatCurrency(pendingInCents)} />
        <Metric label="Despesas" value={formatCurrency(expensesInCents)} />
      </div>

      <footer className="flex items-center justify-between gap-3 border-t pt-3">
        <span className="text-muted-foreground text-xs">
          Início {formatShortDate(new Date(project.startedAt))}
          {project.deliveredAt && ` · Entrega ${formatShortDate(new Date(project.deliveredAt))}`}
        </span>
        <Button
          size="sm"
          variant="ghost"
          disabled={linkedEntriesCount === 0}
          onClick={() => onViewEntries(project)}
        >
          {linkedEntriesCount === 0
            ? "Sem registros"
            : `Ver ${pluralize(linkedEntriesCount, "registro", "registros")}`}
        </Button>
      </footer>

      <ProjectSheet
        customerId={customerId}
        project={project}
        open={isEditing}
        onOpenChange={setIsEditing}
      />
      <ConfirmDialog
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title={`Excluir o projeto ${project.name}?`}
        description={
          linkedEntriesCount > 0
            ? `${pluralize(linkedEntriesCount, "registro financeiro continua", "registros financeiros continuam")} no extrato, sem projeto.`
            : "Nenhum registro financeiro está vinculado a ele."
        }
        confirmLabel="Excluir"
        destructive
        isPending={isRemoving}
        onConfirm={() => remove(project, () => setIsDeleting(false))}
      />
    </article>
  );
}
