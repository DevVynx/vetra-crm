import type { UseFormRegisterReturn } from "react-hook-form";

const digitsOf = (value: string) => value.replace(/\D/g, "");

export const PHONE_MAX_DIGITS = 15;

// Brazilian by default; a leading + opens it to any country.
export function maskPhone(value: string): string {
  let digits = digitsOf(value);
  const isForeign = value.trimStart().startsWith("+") && !digits.startsWith("55");
  if (isForeign) return `+${digits.slice(0, PHONE_MAX_DIGITS)}`;

  if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);
  digits = digits.slice(0, 11);

  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  const area = digits.slice(0, 2);
  const rest = digits.slice(2);
  const split = digits.length > 10 ? 5 : 4;
  if (rest.length <= split) return `(${area}) ${rest}`;
  return `(${area}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

// A stored number always has its country code, so anything but Brazil needs the + to stay foreign.
export const storedPhoneToInput = (phone: string): string =>
  maskPhone(phone.startsWith("55") ? phone : `+${phone}`);

// CPF up to 11 digits, CNPJ beyond that.
export function maskDocument(value: string): string {
  const digits = digitsOf(value).slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

// Digits fill the cents first, like a bank app: typing 1, 5, 0, 0 gives "R$ 15,00".
export function maskCurrency(value: string): string {
  const digits = digitsOf(value).slice(0, 11);
  if (!digits) return "";
  const amount = Number(digits) / 100;
  return `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export const maskNoSpaces = (value: string) => value.replace(/\s/g, "");

// Rewrites what is typed before react-hook-form reads it, so the field never shows
// characters the mask rejects.
export function masked(registration: UseFormRegisterReturn, mask: (value: string) => string) {
  return {
    ...registration,
    onChange: (event: Parameters<UseFormRegisterReturn["onChange"]>[0]) => {
      const target = event.target as HTMLInputElement;
      target.value = mask(target.value);
      return registration.onChange(event);
    },
  };
}
