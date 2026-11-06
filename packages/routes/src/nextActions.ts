export const nextActionsRoutes = {
  base: "/next-actions",
  byLead: "/leads/:id/next-actions",
  byId: "/next-actions/:id",
  complete: "/next-actions/:id/complete",
  reopen: "/next-actions/:id/reopen",
  send: "/next-actions/:id/send",
  restore: "/next-actions/restore",
} as const;
