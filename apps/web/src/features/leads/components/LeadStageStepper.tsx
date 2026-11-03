import type { LeadDetail, Stage } from "@vetra/contracts";
import { CheckIcon, MilestoneIcon, Undo2Icon } from "lucide-react";
import { useState } from "react";

import { LeadStageBadge } from "@/shared/components/LeadStageBadge";
import { Section } from "@/shared/components/Section";
import { Button } from "@/shared/components/ui/button";
import { useStages } from "@/shared/stages/useStages";
import { cn } from "@/shared/utils/cn";

import { useChangeLeadStage } from "../mutations/useChangeLeadStage";
import { CloseLeadSheet } from "./CloseLeadSheet";

function StepMarker({ stage, state }: { stage: Stage; state: "done" | "current" | "upcoming" }) {
  if (state === "upcoming") {
    return (
      <span className="bg-card border-border group-hover/step:border-foreground/40 size-6 rounded-full border transition-colors" />
    );
  }

  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-full",
        state === "current" && "ring-foreground/15 ring-4"
      )}
      style={{ backgroundColor: stage.color }}
    >
      {state === "done" ? (
        <CheckIcon className="text-background size-3.5" strokeWidth={3} />
      ) : (
        <span className="bg-background size-2 rounded-full" />
      )}
    </span>
  );
}

type StepperProps = {
  stage: string;
  onSelect: (stage: Stage) => void;
};

function Stepper({ stage, onSelect }: StepperProps) {
  const { funnel } = useStages();
  const currentIndex = funnel.findIndex((step) => step.id === stage);

  return (
    <ol className="-mx-1 -mt-1 flex overflow-x-auto px-1 pt-1 pb-1">
      {funnel.map((step, index) => {
        const state =
          index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
        const isFirst = index === 0;
        const isLast = index === funnel.length - 1;

        return (
          <li
            key={step.id}
            aria-current={state === "current" ? "step" : undefined}
            className="min-w-20 flex-1"
          >
            <button
              type="button"
              disabled={state === "current"}
              onClick={() => onSelect(step)}
              className="group/step focus-visible:ring-ring/50 flex w-full cursor-pointer flex-col items-center gap-2 rounded-md outline-none focus-visible:ring-3 disabled:cursor-default"
            >
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-px flex-1",
                    isFirst
                      ? "bg-transparent"
                      : index <= currentIndex
                        ? "bg-foreground/40"
                        : "bg-border"
                  )}
                />
                <StepMarker stage={step} state={state} />
                <span
                  className={cn(
                    "h-px flex-1",
                    isLast
                      ? "bg-transparent"
                      : index < currentIndex
                        ? "bg-foreground/40"
                        : "bg-border"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-center text-xs transition-colors",
                  state === "current"
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground group-hover/step:text-foreground"
                )}
              >
                {step.name}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

type ArchivedStageProps = {
  lead: LeadDetail;
  onReactivate: () => void;
  isPending: boolean;
};

function ArchivedStage({ lead, onReactivate, isPending }: ArchivedStageProps) {
  const stages = useStages();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <LeadStageBadge stage={lead.stage} />
      <span className="text-muted-foreground">
        {lead.stoppedAtStage
          ? `Arquivado. Parou em ${stages.nameOf(lead.stoppedAtStage)}.`
          : "Arquivado."}
      </span>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        disabled={isPending}
        onClick={onReactivate}
      >
        <Undo2Icon />
        Reativar
      </Button>
    </div>
  );
}

export function LeadStageStepper({ lead }: { lead: LeadDetail }) {
  const [isClosing, setIsClosing] = useState(false);
  const stages = useStages();
  const { changeStage, isPending } = useChangeLeadStage(lead.id);
  const isArchived = stages.isArchive(lead.stage);

  const select = (stage: Stage) => {
    if (stage.role === "closing") return setIsClosing(true);
    changeStage(stage.id, lead.stage, `Etapa alterada para ${stage.name}`);
  };

  const reactivate = () => {
    const target = lead.stoppedAtStage ?? stages.entry.id;
    changeStage(target, lead.stage, `Lead reativado em ${stages.nameOf(target)}`);
  };

  return (
    <Section title="Etapa" icon={MilestoneIcon} iconClassName="text-chart-1">
      {isArchived ? (
        <ArchivedStage lead={lead} onReactivate={reactivate} isPending={isPending} />
      ) : (
        <Stepper stage={lead.stage} onSelect={select} />
      )}
      <CloseLeadSheet
        leadId={lead.id}
        businessName={lead.businessName}
        open={isClosing}
        onOpenChange={setIsClosing}
      />
    </Section>
  );
}
