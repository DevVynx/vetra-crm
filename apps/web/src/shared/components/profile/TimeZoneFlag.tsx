import * as flags from "country-flag-icons/react/3x2";
import { GlobeIcon } from "lucide-react";

type TimeZoneFlagProps = {
  countryCode: string;
};

export function TimeZoneFlag({ countryCode }: TimeZoneFlagProps) {
  const Flag = flags[countryCode as keyof typeof flags];

  if (!Flag) return <GlobeIcon className="text-muted-foreground size-4 shrink-0" />;

  return <Flag aria-hidden className="h-3 w-4.5 shrink-0 rounded-[2px]" />;
}
