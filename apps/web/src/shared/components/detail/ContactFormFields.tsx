import { demoUrlSchema } from "@vetra/contracts";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { OptionalTag } from "@/shared/components/OptionalTag";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  type ContactFormValues,
  INVALID_PHONE_MESSAGE,
  isValidPhone,
  normalizeDemoUrl,
} from "@/shared/utils/contactForm";
import { maskDocument, masked, maskNoSpaces, maskPhone } from "@/shared/utils/masks";

const required = (message: string) => (value: string) => value.trim().length > 0 || message;

type ContactFormFieldsProps = {
  showDocument?: boolean;
  showDemo?: boolean;
};

// Fields of a lead or customer; must sit inside a react-hook-form FormProvider.
export function ContactFormFields({
  showDocument = false,
  showDemo = false,
}: ContactFormFieldsProps) {
  const { register, formState } = useFormContext<ContactFormValues>();
  const { errors } = formState;

  return (
    <>
      <Field data-invalid={Boolean(errors.businessName)}>
        <FieldLabel htmlFor="contact-business-name">Nome do negócio</FieldLabel>
        <Input
          id="contact-business-name"
          autoFocus
          placeholder="Ex.: Padaria Bom Pão"
          aria-invalid={Boolean(errors.businessName)}
          {...register("businessName", { validate: required("Informe o nome do negócio.") })}
        />
        <FieldError errors={[errors.businessName]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-name">
          Contato <OptionalTag />
        </FieldLabel>
        <Input id="contact-name" placeholder="Ex.: Maria Silva" {...register("contactName")} />
      </Field>

      <Field data-invalid={Boolean(errors.phone)}>
        <FieldLabel htmlFor="contact-phone">Telefone (WhatsApp)</FieldLabel>
        <Input
          id="contact-phone"
          inputMode="tel"
          placeholder="(31) 98888-7777"
          aria-invalid={Boolean(errors.phone)}
          {...masked(
            register("phone", {
              validate: (value) => isValidPhone(value) || INVALID_PHONE_MESSAGE,
            }),
            maskPhone
          )}
        />
        <FieldError errors={[errors.phone]} />
      </Field>

      {showDocument && (
        <Field>
          <FieldLabel htmlFor="contact-document">
            Documento (CPF ou CNPJ) <OptionalTag />
          </FieldLabel>
          <Input
            id="contact-document"
            inputMode="numeric"
            placeholder="000.000.000-00"
            {...masked(register("document"), maskDocument)}
          />
        </Field>
      )}

      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor="contact-email">
          E-mail <OptionalTag />
        </FieldLabel>
        <Input
          id="contact-email"
          inputMode="email"
          placeholder="contato@empresa.com.br"
          aria-invalid={Boolean(errors.email)}
          {...masked(
            register("email", {
              validate: (value) =>
                value.trim() === "" ||
                z.email().safeParse(value.trim()).success ||
                "E-mail inválido.",
            }),
            maskNoSpaces
          )}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      {showDemo && (
        <Field data-invalid={Boolean(errors.demoUrl)}>
          <FieldLabel htmlFor="contact-demo-url">
            Demo <OptionalTag />
          </FieldLabel>
          <Input
            id="contact-demo-url"
            inputMode="url"
            placeholder="https://padaria-bom-pao.vercel.app"
            aria-invalid={Boolean(errors.demoUrl)}
            {...masked(
              register("demoUrl", {
                validate: (value) =>
                  value.trim() === "" ||
                  demoUrlSchema.safeParse(normalizeDemoUrl(value)).success ||
                  "Link inválido.",
              }),
              maskNoSpaces
            )}
          />
          <FieldError errors={[errors.demoUrl]} />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field data-invalid={Boolean(errors.niche)}>
          <FieldLabel htmlFor="contact-niche">Nicho</FieldLabel>
          <Input
            id="contact-niche"
            placeholder="Ex.: Padaria"
            aria-invalid={Boolean(errors.niche)}
            {...register("niche", { validate: required("Informe o nicho.") })}
          />
          <FieldError errors={[errors.niche]} />
        </Field>
        <Field data-invalid={Boolean(errors.city)}>
          <FieldLabel htmlFor="contact-city">Cidade</FieldLabel>
          <Input
            id="contact-city"
            placeholder="Ex.: São Paulo"
            aria-invalid={Boolean(errors.city)}
            {...register("city", { validate: required("Informe a cidade.") })}
          />
          <FieldError errors={[errors.city]} />
        </Field>
      </div>
    </>
  );
}
