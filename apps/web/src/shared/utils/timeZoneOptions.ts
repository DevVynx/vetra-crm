import { getTimeZones, type TimeZone } from "@vvo/tzdb";

import { normalizeText } from "@/shared/utils/text";

export type TimeZoneOption = TimeZone;

export type TimeZoneOptionGroup = {
  value: string;
  items: TimeZoneOption[];
};

const UTC_LABEL = "UTC";

// One entry per country and clock: zones that always show the same time are grouped.
const options = getTimeZones({ includeUtc: true, locale: "pt-BR" }).sort(
  (a, b) =>
    (a.countryName || UTC_LABEL).localeCompare(b.countryName || UTC_LABEL, "pt-BR") ||
    a.rawOffsetInMinutes - b.rawOffsetInMinutes
);

export const findTimeZoneOption = (timeZone: string) =>
  options.find((option) => option.group.includes(timeZone));

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// The zone of the browser, when it is one of the options; what a new install starts from.
export const suggestedTimeZoneOf = (fallback: string): string =>
  findTimeZoneOption(browserTimeZone)?.name ?? fallback;

export function groupedTimeZoneOptions(): TimeZoneOptionGroup[] {
  const suggested = findTimeZoneOption(browserTimeZone);
  const others = options.filter((option) => option !== suggested);
  return [
    ...(suggested ? [{ value: "Sugerido", items: [suggested] }] : []),
    { value: "Todos os fusos", items: others },
  ];
}

export const timeZoneTitleOf = (option: TimeZoneOption) =>
  option.countryName
    ? `${option.countryName} · ${option.alternativeName.replace(" Padrão", "")}`
    : UTC_LABEL;

export const timeZoneCitiesOf = (option: TimeZoneOption) =>
  option.mainCities.filter(Boolean).join(", ");

export const offsetLabelOf = (option: TimeZoneOption) => {
  const minutes = option.currentTimeOffsetInMinutes;
  const sign = minutes < 0 ? "−" : "+";
  const hours = Math.floor(Math.abs(minutes) / 60);
  const rest = Math.abs(minutes) % 60;
  return `UTC${sign}${hours}${rest ? `:${String(rest).padStart(2, "0")}` : ""}`;
};

export const currentTimeIn = (option: TimeZoneOption) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: option.name,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

export function matchesTimeZoneQuery(option: TimeZoneOption, query: string) {
  const normalizedQuery = normalizeText(query.trim());
  if (!normalizedQuery) return true;

  const haystack = normalizeText(
    [
      option.countryName,
      option.alternativeName,
      option.abbreviation,
      ...option.mainCities,
      ...option.group,
    ].join(" ")
  ).replaceAll("_", " ");
  return haystack.includes(normalizedQuery);
}
