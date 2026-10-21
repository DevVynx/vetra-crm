import type { DashboardPeriod } from "@vetra/contracts";
import { startOfMonth, startOfWeek, startOfYear, subMonths, subWeeks, subYears } from "date-fns";

export type DateRange = { start: Date; end: Date };

export type PeriodRanges = {
  current: DateRange | null;
  previous: DateRange | null;
};

// The previous range stops at the same point of its period ("month to date" vs. "last
// month up to the same day"), otherwise an unfinished period always looks worse.
export function periodRanges(period: DashboardPeriod, now = new Date()): PeriodRanges {
  switch (period) {
    case "week": {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      return {
        current: { start, end: now },
        previous: { start: subWeeks(start, 1), end: subWeeks(now, 1) },
      };
    }
    case "month": {
      const start = startOfMonth(now);
      return {
        current: { start, end: now },
        previous: { start: subMonths(start, 1), end: subMonths(now, 1) },
      };
    }
    case "six_months": {
      const start = subMonths(now, 6);
      return {
        current: { start, end: now },
        previous: { start: subMonths(now, 12), end: start },
      };
    }
    case "year": {
      const start = startOfYear(now);
      return {
        current: { start, end: now },
        previous: { start: subYears(start, 1), end: subYears(now, 1) },
      };
    }
    case "all_time":
      return { current: null, previous: null };
  }
}

export function isWithin(iso: string, range: DateRange | null): boolean {
  if (!range) return true;
  const date = new Date(iso);
  return date >= range.start && date <= range.end;
}
