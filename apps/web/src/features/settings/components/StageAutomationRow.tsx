import type { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { useStages } from "@/shared/stages/useStages";

import { SettingsRow } from "./SettingsRow";

type StageAutomationRowProps = {
  title: string;
  description: string;
  isEnabled: boolean;
  stageId: string | null;
  // The stages the automation can move a lead to.
  stageIds: string[];
  isPending: boolean;
  // Extra controls shown before the stage selector, such as a number of days.
  children?: ReactNode;
  onEnabledChange: (isEnabled: boolean) => void;
  onStageChange: (stageId: string) => void;
};

// An automation that moves a lead: its switch and the stage to move it to. The stage must be chosen before the
// switch can be turned on, since without a target there is nothing to do.
export function StageAutomationRow({
  title,
  description,
  isEnabled,
  stageId,
  stageIds,
  isPending,
  children,
  onEnabledChange,
  onStageChange,
}: StageAutomationRowProps) {
  const stages = useStages();
  const hasTarget = stageId !== null && stageIds.includes(stageId);

  return (
    <SettingsRow title={title} description={description}>
      <div className="flex items-center gap-3">
        {children}
        <Select
          value={hasTarget ? stageId : null}
          onValueChange={(value) => value && onStageChange(value)}
        >
          <SelectTrigger aria-label={`Etapa: ${title}`} className="w-44">
            <SelectValue placeholder="Escolher etapa">
              {(value: string | null) => (value ? stages.nameOf(value) : "Escolher etapa")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {stageIds.map((id) => (
              <SelectItem key={id} value={id}>
                {stages.nameOf(id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Switch
          aria-label={title}
          checked={isEnabled && hasTarget}
          disabled={isPending || !hasTarget}
          onCheckedChange={onEnabledChange}
        />
      </div>
    </SettingsRow>
  );
}
