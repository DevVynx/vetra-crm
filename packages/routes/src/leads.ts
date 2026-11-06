export const leadsRoutes = {
  base: "/leads",
  filterOptions: "/leads/filter-options",
  ids: "/leads/ids",
  lookup: "/leads/lookup",
  bySlug: "/leads/by-slug/:slug",
  doNotContact: "/leads/:id/do-not-contact",
  autoSend: "/leads/:id/auto-send",
  stage: "/leads/stage",
  stageRestore: "/leads/stage/restore",
  byId: "/leads/:id",
} as const;
