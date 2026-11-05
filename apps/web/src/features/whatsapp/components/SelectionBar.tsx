import { Trash2Icon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

type SelectionBarProps = {
  count: number;
  isConnected: boolean;
  onCancel: () => void;
  onDelete: () => void;
};

export function SelectionBar({ count, isConnected, onCancel, onDelete }: SelectionBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-t p-3">
      <span className="text-sm">
        {count === 0
          ? "Selecione mensagens suas"
          : `${count} ${count === 1 ? "selecionada" : "selecionadas"}`}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="destructive" disabled={count === 0 || !isConnected} onClick={onDelete}>
          <Trash2Icon />
          Apagar para todos
        </Button>
      </div>
    </div>
  );
}
