import { z } from "zod";

export const filterOperatorSchema = z.enum([
  "is",
  "is_not",
  "is_any_of",
  "is_none_of",
  "contains",
  "not_contains",
  "eq",
  "gt",
  "lt",
  "between",
  "before",
  "after",
  "last_days",
]);
export type FilterOperator = z.infer<typeof filterOperatorSchema>;

export const filterValueSchema = z.union([z.string(), z.number(), z.boolean()]);
export type FilterValue = z.infer<typeof filterValueSchema>;

// How many values each operator takes; undefined means one or more.
const operatorArity: Partial<Record<FilterOperator, number>> = {
  is: 1,
  is_not: 1,
  contains: 1,
  not_contains: 1,
  eq: 1,
  gt: 1,
  lt: 1,
  between: 2,
  before: 1,
  after: 1,
  last_days: 1,
};

export const filterSchema = z
  .object({
    field: z.string().min(1),
    operator: filterOperatorSchema,
    values: z.array(filterValueSchema).min(1),
  })
  .refine(({ operator, values }) => {
    const arity = operatorArity[operator];
    return arity === undefined || values.length === arity;
  }, "invalidFilterValueCount");
export type Filter = z.infer<typeof filterSchema>;

// Malformed JSON is passed on as the raw string, so the array schema rejects it instead of the
// default silently dropping every filter.
function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// The wire format of the `filters` query param: a JSON array, limited to the fields a list
// accepts and to one filter per field.
export const filtersParamSchema = <const TFields extends readonly [string, ...string[]]>(
  fields: TFields
) =>
  z.preprocess(
    parseJson,
    z
      .array(filterSchema)
      .default([])
      .refine(
        (filters) => filters.every(({ field }) => fields.includes(field)),
        "unknownFilterField"
      )
      .refine(
        (filters) => new Set(filters.map(({ field }) => field)).size === filters.length,
        "duplicateFilterField"
      )
  );

export const filterOptionsResponseSchema = z.object({
  items: z.array(z.object({ value: z.string(), label: z.string() })),
});
export type FilterOptionsResponse = z.infer<typeof filterOptionsResponseSchema>;

export const filterOptionsQuerySchema = z.object({ field: z.enum(["niche", "city"]) });
export type FilterOptionsQuery = z.infer<typeof filterOptionsQuerySchema>;
