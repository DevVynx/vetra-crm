import { TZDate } from "@date-fns/tz";
import { startOfDay } from "date-fns";

import { useTimeZoneStore } from "./timeZoneStore";

export const profileTimeZone = () => useTimeZoneStore.getState().timeZone;

// date-fns computes in the zone of the TZDate it receives, so calendar reads ("which day is
// this?") go through these. Values that leave a date helper or a picker stay plain Dates: a
// TZDate serializes with its offset ("-03:00"), which the API contracts reject.
export const inProfileZone = (date: Date | string | number) =>
  new TZDate(new Date(date).getTime(), profileTimeZone());

export const nowInProfileZone = () => TZDate.tz(profileTimeZone());

export const startOfTodayInProfileZone = () => startOfDay(nowInProfileZone());

export const toInstant = (date: Date) => new Date(date.getTime());
