const BRAZILIAN_MOBILE_WITH_NINTH_DIGIT = /^55(\d{2})9(\d{8})$/;

// Always a full international number. In Brazil, WhatsApp ids carry the ninth digit only in some
// regions, while people always type it, so both forms must match. Other countries stay untouched.
export const canonicalPhoneOf = (phone: string): string =>
  phone.replace(/\D/g, "").replace(BRAZILIAN_MOBILE_WITH_NINTH_DIGIT, "55$1$2");
