// The words of the files for what the database keeps as codes. The export writes them and the
// import reads them back, so they are defined once.
export const STAGE_ROLE_WORDS = {
  entry: "entrada",
  middle: "intermediaria",
  closing: "fechamento",
  archive: "arquivo",
} as const;

export const PROJECT_STATUS_WORDS = {
  in_production: "em_producao",
  delivered: "entregue",
} as const;

export const EXPENSE_STATUS_WORDS = { confirmed: "confirmada", pending: "pendente" } as const;

export const NEXT_ACTION_WORDS = {
  first_approach: "primeira_abordagem",
  follow_up: "follow_up",
  meeting: "reuniao",
  proposal: "proposta",
  custom: "personalizada",
} as const;

// The word back to the code it stands for.
export function fromWords<Code extends string>(words: Record<Code, string>): Map<string, Code> {
  return new Map((Object.entries(words) as [Code, string][]).map(([code, word]) => [word, code]));
}
