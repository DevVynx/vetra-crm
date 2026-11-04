import type { UpdateCustomerRequest, UpdateLeadRequest } from "@vetra/contracts";

export type ContactFormValues = {
  businessName: string;
  contactName: string;
  phone: string;
  document: string;
  email: string;
  demoUrl: string;
  niche: string;
  city: string;
};

export const emptyContactValues: ContactFormValues = {
  businessName: "",
  contactName: "",
  phone: "",
  document: "",
  email: "",
  demoUrl: "",
  niche: "",
  city: "",
};

const digitsOf = (value: string) => value.replace(/\D/g, "");

export const normalizePhone = (value: string) => {
  const digits = digitsOf(value);
  return digits.length <= 11 ? `55${digits}` : digits;
};

// Addresses are often pasted without the protocol, as in "site.vercel.app".
export const normalizeDemoUrl = (value: string) => {
  const url = value.trim();
  return url.includes("://") ? url : `https://${url}`;
};

const toContactFields = (values: ContactFormValues) => ({
  businessName: values.businessName.trim(),
  contactName: values.contactName.trim() || null,
  niche: values.niche.trim(),
  city: values.city.trim(),
  phone: normalizePhone(values.phone),
  email: values.email.trim() || null,
});

export const toLeadRequest = (values: ContactFormValues): UpdateLeadRequest => ({
  ...toContactFields(values),
  demoUrl: values.demoUrl.trim() ? normalizeDemoUrl(values.demoUrl) : null,
});

export const toCustomerRequest = (values: ContactFormValues): UpdateCustomerRequest => ({
  ...toContactFields(values),
  document: values.document.trim() || null,
});
