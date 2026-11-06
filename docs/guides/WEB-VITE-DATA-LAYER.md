# Web Data Layer

TanStack Query conventions, the axios client, and cache management for `apps/web`.
Load this guide when adding a query/mutation or touching cache state.

## The axios client

`shared/lib/axios/api.ts` default-exports a single configured `axios` instance
(`baseURL` from `envConfig.get()`). Every HTTP call goes through it — never a bare
`axios.get(...)`/`fetch(...)` call anywhere else in the app. There is no
authentication, so there are no credentials, cookies, or session-refresh
interceptors.

## Query convention: `queryOptions()`

One `queryOptions({ queryKey, queryFn, ... })` per resource, exported so it can be
reused both by a component-facing `useX()` hook and by an imperative call elsewhere
(e.g. a route's `loader`). Never inline a `queryKey`/`queryFn` pair directly inside a
component. Paths come from `@vetra/routes`, with `buildPath` filling their parameters.
Simplified from `shared/queries/leads/useLead.ts`:

```ts
export const leadQueryOptions = (leadId: string) =>
  queryOptions({
    queryKey: leadsQueryKeys.detail(leadId),
    queryFn: async () =>
      (await api.get<GetLeadResponse>(buildPath(leadsRoutes.byId, { id: leadId }))).data,
  });

export function useLead(leadId: string) {
  return useQuery(leadQueryOptions(leadId));
}
```

An imperative one-off fetch outside a component (e.g. in a route's `loader`) uses
`queryClient.query({ ...xQueryOptions, staleTime: "static" })`. `ensureQueryData` is
deprecated as of the pinned TanStack Query version — confirm against the installed
`.d.ts` before relying on either name, this is a fast-moving API.

## Mutation convention

One `useX()` hook per mutation, under `features/<name>/mutations/`, wrapping
`useMutation`. A mutation that needs to update another query's cached data does so
through `useQueryUtils` (below) inside its `onSuccess`, not by importing
`useQueryClient` directly in the mutation hook.

## Shared queries and mutations

A query or mutation lives in its feature (`features/<name>/queries`, `mutations`). When two or
more features need the same data, it moves to `shared/queries/<domain>/` (query hooks and their
`keys.ts`) or `shared/mutations/<domain>/` (mutation hooks and cache-invalidation helpers),
never to `shared/hooks/`, which is only for generic UI hooks (`useHotkey`, `useDebouncedCallback`...).

Today: `shared/queries/leads` (`useLead`, keys) and `shared/mutations/leads`
(`useInvalidateAfterLeadChange`) are used by both `features/leads` and `features/customers`, since
a customer is a won lead. `shared/queries/next-actions` and `shared/mutations/next-actions` serve
the dashboard and the lead screen, through the shared `next-actions` components.

Don't move something there "just in case": start in the feature and promote it when a second
feature needs it.

## `useQueryUtils`

`shared/lib/tanstack/useQueryUtils.ts` is a thin, typed wrapper over
`getQueryData`/`setQueryData`/`invalidateQueries`/`refetchQueries`/`removeQueries` for
one query key. Prefer it over calling `useQueryClient()` methods directly when the
intent is one of these five operations on a specific, known query key.

**`setData(undefined)` is a documented TanStack Query v5 no-op** — it skips updates
that resolve to `undefined`. To actually clear cached data, call `remove()`, not
`setData(undefined)`.

## Turning errors into user-facing text

`shared/utils/getErrorMessage.ts` turns any API error into text for the user:

- When the response has `issues[]` and every issue code has a sentence in its
  `validationMessages` map, it returns those sentences without repeats.
- In every other case, it returns the caller's Portuguese fallback (default
  `"Algo deu errado."`), so each mutation passes one that names the action, like
  `"Não foi possível salvar o lead."`.

The response's `message` is never shown: it is English text for developers. A new custom
refinement code in the contracts needs its sentence in `validationMessages`, otherwise the
user gets the fallback. Never render a raw error object or a raw Zod code as UI text.

## Query client defaults

`shared/lib/tanstack/queryClient.ts` sets `refetchOnWindowFocus: false`,
`refetchOnReconnect: false`, and a 5-minute `staleTime` as global defaults. A query
that overrides one of these needs a specific reason for that resource, not a
copy-pasted override.

It also sets which failures are asked again: at most two more times, and **only a failure that may
pass**. A server that doesn't answer is left to the notice below, and one that answered with a 4xx
(not found, a conflict, an invalid value) would answer the same, only later.

## When the server can't be reached

The API and its Docker services are things the user starts, so the web has to say when they are not
there. `shared/connection/` holds it: the query client's `QueryCache` and `MutationCache` hand every
failure to `reportFailure`, which ignores what isn't a connection problem (no answer, or a 500/502/504),
asks the API for the profile once, and only if that fails too sets `useConnectionStore.isLost`.
The app shell (`routes/_app.tsx`) then shows `ConnectionLostNotice` in place of the screens, which asks
again every few seconds and reloads the data when the server answers. One endpoint failing, with the
server up, never shows it. A screen whose own code fails shows `RouteError` (the router's
`defaultErrorComponent`), whose retry also clears the query cache, since what a screen drew from may be
what broke it.

## Server signals (SSE)

For things that change on their own, like WhatsApp messages, the API sends a signal over
Server-Sent Events and the web **refetches with its normal queries**. The signal carries no
data, so nothing sensitive travels over it and shapes stay defined in one place. The hook that
owns the connection reconnects by itself after an error response, which the browser never
retries on its own, and refetches whenever the connection returns. A slow interval refetch stays
as a safety net for a lost signal. Query keys of one area share a prefix
(`whatsappQueryKeys.all`), so one invalidation refreshes the list, the thread, the lead card and
the Painel together.

## Files asked for on demand

A file the API serves (a message's image, video or audio) is asked for with the normal axios client
as a blob, only when the user clicks, and shown from a temporary address (`URL.createObjectURL`). The
hook that owns it releases the address when the component leaves the screen, so nothing is cached.
It isn't a query: a blob has no key worth keeping, and an `<img src>` pointing at the API would
skip the origin protection and the CORS rules that every other request goes through. An error from
it is turned into text by status in one place (`mediaErrorMessage`), like the others.

**The exception is the profile photo,** which is an `<img src>` with a version in its address; see
"Files the API owns" in `API-OVERVIEW.md` for why, and for why nothing else should do it.
