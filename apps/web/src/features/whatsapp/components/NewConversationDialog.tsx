import { useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { INVALID_PHONE_MESSAGE, isValidPhone, normalizePhone } from "@/shared/utils/contactForm";
import { masked, maskPhone } from "@/shared/utils/masks";

import { useOpenWhatsappConversation } from "../mutations/useOpenWhatsappConversation";
import { whatsappErrorMessage } from "../utils/whatsappErrors";

type NewConversationValues = { phone: string };

type NewConversationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpened: (conversationId: string) => void;
};

export function NewConversationDialog({
  open,
  onOpenChange,
  onOpened,
}: NewConversationDialogProps) {
  const openConversation = useOpenWhatsappConversation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<NewConversationValues>({ defaultValues: { phone: "" } });

  const close = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  };

  const submit = ({ phone }: NewConversationValues) =>
    openConversation.mutate(
      { phone: normalizePhone(phone) },
      {
        onSuccess: ({ id }) => {
          close(false);
          onOpened(id);
        },
        onError: (error) =>
          setError("phone", {
            message: whatsappErrorMessage(error, "Não foi possível abrir a conversa."),
          }),
      }
    );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conversa</DialogTitle>
          <DialogDescription>
            Informe o número com DDD. Para outros países, comece com + e o código do país.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(submit)} noValidate>
          <Field data-invalid={Boolean(errors.phone)}>
            <FieldLabel htmlFor="new-conversation-phone">Telefone (WhatsApp)</FieldLabel>
            <Input
              id="new-conversation-phone"
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
          <Button type="submit" className="font-semibold" disabled={openConversation.isPending}>
            {openConversation.isPending && <Spinner />}
            Abrir conversa
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
