import type { CustomerDetail } from "@vetra/contracts";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { ActionsMenu } from "@/shared/components/ActionsMenu";

import { DeleteCustomerDialog } from "./DeleteCustomerDialog";
import { EditCustomerSheet } from "./EditCustomerSheet";

export function CustomerActionsMenu({ customer }: { customer: CustomerDetail }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
            onSelect: () => setIsDeleting(true),
          },
        ]}
      />
      <EditCustomerSheet customer={customer} open={isEditing} onOpenChange={setIsEditing} />
      <DeleteCustomerDialog customer={customer} open={isDeleting} onOpenChange={setIsDeleting} />
    </>
  );
}
