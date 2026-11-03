import { type CreateCustomerResponse, createCustomerResponseSchema } from "@vetra/contracts";
import { customerServices } from "@vetra/core";
import type { Response } from "express";

import { toLeadSummary } from "@/features/leads/helpers/leadResponses";
import type { ValidatedRequest } from "@/shared/http/validation";

import { fromDealPayment } from "../helpers/customerResponses";
import type v from "../validators";

export async function createCustomerController(
  req: ValidatedRequest<typeof v.createCustomer>,
  res: Response<CreateCustomerResponse>
) {
  const {
    document,
    closedValueInCents,
    receivedInCents,
    installmentsCount,
    firstInstallmentDueAt,
    ...contact
  } = req.body;
  const lead = await customerServices.createCustomer({
    contact,
    document,
    payment: fromDealPayment({
      closedValueInCents,
      receivedInCents,
      installmentsCount,
      firstInstallmentDueAt,
    }),
  });
  res.status(201).json(createCustomerResponseSchema.parse(toLeadSummary(lead)));
}
