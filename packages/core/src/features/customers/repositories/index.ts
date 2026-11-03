import { findCustomerById } from "./findCustomerById";
import { findCustomerFieldValues } from "./findCustomerFieldValues";
import { findCustomerFigures } from "./findCustomerFigures";
import { findCustomersPage } from "./findCustomersPage";
import { insertCustomer } from "./insertCustomer";
import { saveClosing } from "./saveClosing";
import { updateCustomerProfile } from "./updateCustomerProfile";

export type { CustomerFigures } from "./findCustomerFigures";
export type { CustomerListRow } from "./findCustomersPage";

export const customerRepositories = {
  findCustomerById,
  findCustomerFieldValues,
  findCustomerFigures,
  findCustomersPage,
  insertCustomer,
  saveClosing,
  updateCustomerProfile,
};
