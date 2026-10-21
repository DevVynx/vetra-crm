import type { NextAction } from "@vetra/contracts";
import { isBefore, isToday, startOfToday } from "date-fns";

export type GroupedNextActions = {
  overdue: NextAction[];
  today: NextAction[];
};

const byDueDate = (a: NextAction, b: NextAction) => a.dueAt.localeCompare(b.dueAt);

export function groupNextActions(actions: NextAction[]): GroupedNextActions {
  const sorted = [...actions].sort(byDueDate);
  const todayStart = startOfToday();

  return {
    overdue: sorted.filter((action) => isBefore(new Date(action.dueAt), todayStart)),
    today: sorted.filter((action) => isToday(new Date(action.dueAt))),
  };
}
