import type { CustomerProject } from "@vetra/contracts";
import { FolderKanbanIcon } from "lucide-react";

import { SectionEmpty } from "@/shared/components/SectionEmpty";
import { SectionSkeleton } from "@/shared/components/SectionSkeleton";

import { useCustomerProjects } from "../queries/useCustomerProjects";
import { ProjectCard } from "./ProjectCard";

type ProjectsTabProps = {
  customerId: string;
  onViewEntries: (project: CustomerProject) => void;
};

export function ProjectsTab({ customerId, onViewEntries }: ProjectsTabProps) {
  const { data, isPending } = useCustomerProjects(customerId);
  const projects = data?.projects ?? [];

  if (isPending) return <SectionSkeleton rows={2} />;
  if (projects.length === 0) {
    return (
      <SectionEmpty
        icon={FolderKanbanIcon}
        title="Nenhum projeto"
        description="Crie um projeto para vincular os registros financeiros a ele."
      />
    );
  }

  return (
    <div className="@container">
      <div className="grid gap-4 @3xl:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            customerId={customerId}
            project={project}
            onViewEntries={onViewEntries}
          />
        ))}
      </div>
    </div>
  );
}
