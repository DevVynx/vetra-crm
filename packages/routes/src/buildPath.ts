type ParamsOf<TPath extends string> = TPath extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ParamsOf<`/${Rest}`>
  : TPath extends `${string}:${infer Param}`
    ? Param
    : never;

// Fills the ":param" segments of a route with encoded values; every param must be given.
export function buildPath<TPath extends string>(
  path: TPath,
  params: Record<ParamsOf<TPath>, string>
): string {
  const values = params as Record<string, string>;
  return path.replace(/:(\w+)/g, (_, name: string) => encodeURIComponent(values[name] ?? ""));
}
