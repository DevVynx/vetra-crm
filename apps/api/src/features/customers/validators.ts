import {
  closeLeadRequestSchema,
  createCustomerRequestSchema,
  customerParamsSchema,
  filterOptionsQuerySchema,
  leadParamsSchema,
  listCustomersQuerySchema,
  updateCustomerRequestSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  listCustomers: validation({ query: listCustomersQuerySchema }),
  getCustomerFilterOptions: validation({ query: filterOptionsQuerySchema }),
  getCustomer: validation({ params: customerParamsSchema }),
  createCustomer: validation({ body: createCustomerRequestSchema }),
  updateCustomer: validation({ params: customerParamsSchema, body: updateCustomerRequestSchema }),
  deleteCustomer: validation({ params: customerParamsSchema }),
  closeLead: validation({ params: leadParamsSchema, body: closeLeadRequestSchema }),
};

export default v;
