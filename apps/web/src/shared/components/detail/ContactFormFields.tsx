import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { type ContactFormValues, normalizePhone } from "@/shared/utils/contactForm";
import { maskDocument, masked, maskNoSpaces, maskPhone } from "@/shared/utils/masks";

const required = (message: string) => (value: string) => value.trim().length > 0 || message;

// Fields of a lead or customer; must sit inside a react-hook-form FormProvider.
export function ContactFormFields({ showDocument = false }: { showDocument?: boolean }) {
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
        <FieldLabel htmlFor="contact-name">Contato</FieldLabel>
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
              validate: (value) =>
                /^\d{10,15}$/.test(normalizePhone(value)) || "Informe o número com DDD.",
            }),
            maskPhone
          )}
        />
        <FieldError errors={[errors.phone]} />
      </Field>

      {showDocument && (
        <Field>
          <FieldLabel htmlFor="contact-document">Documento (CPF ou CNPJ)</FieldLabel>
          <Input
            id="contact-document"
            inputMode="numeric"
            placeholder="000.000.000-00"
            {...masked(register("document"), maskDocument)}
          />
        </Field>
      )}

      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor="contact-email">E-mail</FieldLabel>
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
            placeholder="Ex.: Ipatinga"
            aria-invalid={Boolean(errors.city)}
            {...register("city", { validate: required("Informe a cidade.") })}
          />
          <FieldError errors={[errors.city]} />
        </Field>
      </div>
    </>
  );
}
