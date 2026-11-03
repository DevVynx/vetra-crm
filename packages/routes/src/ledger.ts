export const ledgerRoutes = {
  byCustomer: "/customers/:id/ledger",
  restore: "/customers/:id/ledger/restore",
  byId: "/customers/:id/ledger/:entryId",
} as const;
