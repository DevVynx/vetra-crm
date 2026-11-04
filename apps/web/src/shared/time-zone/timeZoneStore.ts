import { create } from "zustand";

type TimeZoneState = {
  timeZone: string;
};

// A store instead of a context because date helpers run outside React (query selects, form
// defaults). TimeZoneProvider fills it from the profile before any screen renders.
export const useTimeZoneStore = create<TimeZoneState>(() => ({ timeZone: "America/Sao_Paulo" }));
