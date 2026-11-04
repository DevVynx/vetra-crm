import { Fragment, type ReactNode, useLayoutEffect } from "react";

import { useProfile } from "@/shared/queries/profile/useProfile";

import { useTimeZoneStore } from "./timeZoneStore";

// Holds the screens until the store has the profile's time zone. Date helpers read the store
// without subscribing to it, so the key remounts everything when the zone changes.
export function TimeZoneProvider({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile();
  const storedTimeZone = useTimeZoneStore((state) => state.timeZone);

  useLayoutEffect(() => {
    if (profile) useTimeZoneStore.setState({ timeZone: profile.timeZone });
  }, [profile]);

  if (profile?.timeZone !== storedTimeZone) return null;

  return <Fragment key={storedTimeZone}>{children}</Fragment>;
}
