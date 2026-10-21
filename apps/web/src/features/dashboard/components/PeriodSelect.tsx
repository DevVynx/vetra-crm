import { type DashboardPeriod, dashboardPeriodSchema } from "@vetra/contracts";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import { dashboardPeriodLabels } from "../constants/periods";

type PeriodSelectProps = {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
};

export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  const handleValueChange = (next: unknown) => {
    const parsed = dashboardPeriodSchema.safeParse(next);
    if (parsed.success) onChange(parsed.data);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="dark:bg-background" />}>
        <CalendarIcon />
        {dashboardPeriodLabels[value]}
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={handleValueChange}>
          {dashboardPeriodSchema.options.map((period) => (
            <DropdownMenuRadioItem key={period} value={period}>
              {dashboardPeriodLabels[period]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
