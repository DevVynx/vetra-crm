import { z } from "zod";

export const sortDirectionSchema = z.enum(["asc", "desc"]);
export type SortDirection = z.infer<typeof sortDirectionSchema>;

export const sortParamsShape = <const TFields extends readonly [string, ...string[]]>(
  fields: TFields
) => ({
  sort: z.enum(fields).optional(),
  direction: sortDirectionSchema.optional(),
});

export function checkSortParams(
  { sort, direction }: { sort?: string | undefined; direction?: SortDirection | undefined },
  ctx: z.RefinementCtx
) {
  if (Boolean(sort) !== Boolean(direction)) {
    ctx.addIssue({
      code: "custom",
      path: [sort ? "direction" : "sort"],
      message: "sortAndDirectionGoTogether",
    });
  }
}
