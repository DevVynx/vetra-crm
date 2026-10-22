import type { UpdateCustomerRequest, UpdateLeadRequest } from "@vetra/contracts";

export type ContactFormValues = {
  businessName: string;
  contactName: string;
  phone: string;
  document: string;
  email: string;
  niche: string;
  city: string;
};

export const emptyContactValues: ContactFormValues = {
  businessName: "",
  contactName: "",
  phone: "",
  document: "",
  email: "",
  niche: "",
  city: "",
};

const digitsOf = (value: string) => value.replace(/\D/g, "");

export const normalizePhone = (value: string) => {
  const digits = digitsOf(value);
  return digits.length <= 11 ? `55${digits}` : digits;
};

export const toLeadRequest = (values: ContactFormValues): UpdateLeadRequest => ({
  businessName: values.businessName.trim(),
  contactName: values.contactName.trim() || null,
  niche: values.niche.trim(),
  city: values.city.trim(),
  phone: normalizePhone(values.phone),
  email: values.email.trim() || null,
});

export const toCustomerRequest = (values: ContactFormValues): UpdateCustomerRequest => ({
  ...toLeadRequest(values),
  document: values.document.trim() || null,
});
