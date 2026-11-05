export const customersRoutes = {
  base: "/customers",
  filterOptions: "/customers/filter-options",
  byId: "/customers/:id",
  monthlyFee: "/customers/:id/monthly-fee",
  closeLead: "/leads/:id/close",
} as const;
