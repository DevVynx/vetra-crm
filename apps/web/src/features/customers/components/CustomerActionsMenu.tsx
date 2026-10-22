import type { CustomerDetail } from "@vetra/contracts";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { ActionsMenu } from "@/shared/components/ActionsMenu";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

import { useDeleteCustomer } from "../mutations/useDeleteCustomer";
import { EditCustomerSheet } from "./EditCustomerSheet";

export function CustomerActionsMenu({ customer }: { customer: CustomerDetail }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCustomer = useDeleteCustomer(customer.id);

  return (
    <>
      <ActionsMenu
        label="Ações do cliente"
        items={[
          { label: "Editar cliente", icon: PencilIcon, onSelect: () => setIsEditing(true) },
          {
            label: "Excluir cliente",
            icon: Trash2Icon,
            destructive: true,
            separatorBefore: true,
            onSelect: () => setIsDeleting(true),
          },
        ]}
      />
      <EditCustomerSheet customer={customer} open={isEditing} onOpenChange={setIsEditing} />
      <ConfirmDialog
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title={`Excluir ${customer.businessName}?`}
        description="O cliente, o financeiro e os projetos serão apagados. Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        destructive
        isPending={deleteCustomer.isPending}
        onConfirm={() => deleteCustomer.mutate()}
      />
    </>
  );
}
