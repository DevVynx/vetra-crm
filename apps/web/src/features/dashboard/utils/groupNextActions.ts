import type { NextAction } from "@vetra/contracts";
import { isBefore, isToday } from "date-fns";

import { inProfileZone, startOfTodayInProfileZone } from "@/shared/time-zone/zonedDate";

export type GroupedNextActions = {
  overdue: NextAction[];
  today: NextAction[];
};

const byDueDate = (a: NextAction, b: NextAction) => a.dueAt.localeCompare(b.dueAt);

export function groupNextActions(actions: NextAction[]): GroupedNextActions {
  const sorted = [...actions].sort(byDueDate);
  const todayStart = startOfTodayInProfileZone();

  return {
    overdue: sorted.filter((action) => isBefore(new Date(action.dueAt), todayStart)),
    today: sorted.filter((action) => isToday(inProfileZone(action.dueAt))),
  };
}
