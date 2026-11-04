import type { CustomerDetail } from "@vetra/contracts";
import { useState } from "react";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

import { useDeleteCustomer } from "../mutations/useDeleteCustomer";

type DeleteCustomerDialogProps = {
  customer: CustomerDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteCustomerDialog({ customer, open, onOpenChange }: DeleteCustomerDialogProps) {
  const [typedName, setTypedName] = useState("");
  const deleteCustomer = useDeleteCustomer(customer.id);

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) setTypedName("");
    onOpenChange(nextOpen);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={changeOpen}
      title={`Excluir ${customer.businessName}?`}
      description="O cliente, todo o histórico financeiro, os projetos, as notas e as próximas ações serão apagados permanentemente. Essa ação não pode ser desfeita."
      confirmLabel="Excluir"
      destructive
      isPending={deleteCustomer.isPending}
      confirmDisabled={typedName !== customer.businessName}
      onConfirm={() => deleteCustomer.mutate()}
    >
      <Field>
        <FieldLabel htmlFor="delete-customer-name">
          <span className="text-muted-foreground font-normal">
            Digite <span className="text-foreground font-semibold">{customer.businessName}</span>{" "}
            para confirmar
          </span>
        </FieldLabel>
        <Input
          id="delete-customer-name"
          autoComplete="off"
          value={typedName}
          onChange={(event) => setTypedName(event.target.value)}
        />
      </Field>
    </ConfirmDialog>
  );
}
