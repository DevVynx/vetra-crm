import { customersRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  closeLeadController,
  createCustomerController,
  deleteCustomerController,
  getCustomerController,
  getCustomerFilterOptionsController,
  listCustomersController,
  updateCustomerController,
} from "./controllers";
import v from "./validators";

export const customersRouter: Router = Router();

customersRouter.get(customersRoutes.base, v.listCustomers, listCustomersController);
customersRouter.post(customersRoutes.base, v.createCustomer, createCustomerController);
// /customers/filter-options goes before /customers/:id, otherwise it would be read as an id.
customersRouter.get(
  customersRoutes.filterOptions,
  v.getCustomerFilterOptions,
  getCustomerFilterOptionsController
);
customersRouter.get(customersRoutes.byId, v.getCustomer, getCustomerController);
customersRouter.patch(customersRoutes.byId, v.updateCustomer, updateCustomerController);
customersRouter.delete(customersRoutes.byId, v.deleteCustomer, deleteCustomerController);
customersRouter.post(customersRoutes.closeLead, v.closeLead, closeLeadController);
