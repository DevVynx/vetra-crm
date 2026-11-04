export type SearchKind = "leads" | "customers" | "projects" | "notes" | "next_actions";

export type SearchItem = {
  id: string;
  primary: string;
  secondary: string;
  targetId: string;
};

export type SearchGroup = {
  kind: SearchKind;
  items: SearchItem[];
};

export type LeadHit = {
  id: string;
  businessName: string;
  contactName: string | null;
  niche: string;
  city: string;
};

// A record that belongs to a lead: a project, a note or a next action.
export type OwnedHit = {
  id: string;
  text: string;
  ownerId: string;
  ownerBusinessName: string;
};

const GROUP_LIMIT = 5;

const EXCERPT_LENGTH = 90;
const EXCERPT_LEAD_IN = 30;

const fromLead = ({ id, businessName, contactName, niche, city }: LeadHit): SearchItem => ({
  id,
  primary: businessName,
  secondary: [contactName, niche, city].filter(Boolean).join(" · "),
  targetId: id,
});

const fromOwned = ({ id, text, ownerId, ownerBusinessName }: OwnedHit): SearchItem => ({
  id,
  primary: text,
  secondary: ownerBusinessName,
  targetId: ownerId,
});

const foldChar = (char: string) => char.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const fold = (text: string) => [...text].map(foldChar).join("");

// Folding can change a text's length, so the match found in the folded text is mapped back.
function matchStart(text: string, term: string): number {
  const offsets: number[] = [];
  let folded = "";
  let offset = 0;
  for (const char of text) {
    const foldedChar = foldChar(char);
    for (let index = 0; index < foldedChar.length; index++) offsets.push(offset);
    folded += foldedChar;
    offset += char.length;
  }
  return offsets[folded.indexOf(fold(term))] ?? 0;
}

// Keeps the match in view, without the rest of a note that can be very long. When the database
// matched something this can't see (unaccent folds a few characters differently), it shows the start.
function excerptAround(content: string, term: string): string {
  const text = content.replace(/\s+/g, " ").trim();
  if (text.length <= EXCERPT_LENGTH) return text;

  const start = matchStart(text, term.replace(/\s+/g, " "));
  const roughFrom = Math.max(0, start - EXCERPT_LEAD_IN);
  const nextWord = text.indexOf(" ", roughFrom) + 1;
  const from = roughFrom > 0 && nextWord > 0 && nextWord <= start ? nextWord : roughFrom;
  const to = Math.min(text.length, from + EXCERPT_LENGTH);

  return `${from > 0 ? "…" : ""}${text.slice(from, to).trim()}${to < text.length ? "…" : ""}`;
}

export const searchDomain = {
  GROUP_LIMIT,
  excerptAround,
  fromLead,
  fromOwned,
};
