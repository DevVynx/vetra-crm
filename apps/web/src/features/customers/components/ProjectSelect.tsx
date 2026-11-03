import { NO_PROJECT_FILTER_VALUE } from "@vetra/contracts";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import { useCustomerProjects } from "../queries/useCustomerProjects";

type ProjectSelectProps = {
  customerId: string;
  value: string | null;
  onChange: (projectId: string | null) => void;
};

export function ProjectSelect({ customerId, value, onChange }: ProjectSelectProps) {
  const { data } = useCustomerProjects(customerId);
  const projects = data?.projects ?? [];
  const selected = projects.find((project) => project.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="dark:bg-input/30 h-10 w-full justify-between px-3 font-normal"
          />
        }
      >
        <span className={selected ? "truncate" : "text-muted-foreground truncate"}>
          {selected?.name ?? "Sem projeto"}
        </span>
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--anchor-width)">
        <DropdownMenuRadioGroup
          value={value ?? NO_PROJECT_FILTER_VALUE}
          onValueChange={(next) => onChange(next === NO_PROJECT_FILTER_VALUE ? null : String(next))}
        >
          <DropdownMenuRadioItem value={NO_PROJECT_FILTER_VALUE}>Sem projeto</DropdownMenuRadioItem>
          {projects.map((project) => (
            <DropdownMenuRadioItem key={project.id} value={project.id}>
              {project.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
