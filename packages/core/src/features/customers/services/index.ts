import { closeLead } from "./closeLead";
import { createCustomer } from "./createCustomer";
import { deleteCustomer } from "./deleteCustomer";
import { getCustomer } from "./getCustomer";
import { listCustomerFieldValues } from "./listCustomerFieldValues";
import { listCustomers } from "./listCustomers";
import { updateCustomer } from "./updateCustomer";

export type { CustomerDetail } from "./getCustomer";

export const customerServices = {
  closeLead,
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomerFieldValues,
  listCustomers,
  updateCustomer,
};
