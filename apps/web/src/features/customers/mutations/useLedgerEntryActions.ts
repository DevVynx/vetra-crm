import { useMutation } from "@tanstack/react-query";
import type {
  CreateLedgerEntryRequest,
  LedgerEntry,
  UpdateLedgerEntryRequest,
} from "@vetra/contracts";
import { toast } from "sonner";

import { customersMockApi } from "@/shared/mocks/customersMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

const toUpdateRequest = ({
  description,
  amountInCents,
  status,
  occurredAt,
}: LedgerEntry): UpdateLedgerEntryRequest => ({ description, amountInCents, status, occurredAt });

export function useLedgerEntryActions(customerId: string) {
  const invalidate = useInvalidateAfterLeadChange();
  const onError = (error: unknown) =>
    toast.error(getErrorMessage(error, "Não foi possível salvar o registro."));

  const removeEntry = useMutation({
    mutationFn: (entryId: string) => customersMockApi.deleteLedgerEntry(customerId, entryId),
    onSuccess: invalidate,
    onError,
  });

  const restoreEntry = useMutation({
    mutationFn: (entry: LedgerEntry) => customersMockApi.restoreLedgerEntry(customerId, entry),
    onSuccess: invalidate,
    onError,
  });

  const createEntry = useMutation({
    mutationFn: (request: CreateLedgerEntryRequest) =>
      customersMockApi.createLedgerEntry(customerId, request),
    onSuccess: invalidate,
    onError,
  });

  const updateEntry = useMutation({
    mutationFn: ({ entryId, request }: { entryId: string; request: UpdateLedgerEntryRequest }) =>
      customersMockApi.updateLedgerEntry(customerId, entryId, request),
    onSuccess: invalidate,
    onError,
  });

  const create = (request: CreateLedgerEntryRequest, onDone: () => void) =>
    createEntry.mutate(request, {
      onSuccess: (entry) => {
        onDone();
        toastWithUndo("Registro criado.", () => removeEntry.mutate(entry.id));
      },
    });

  const update = (entry: LedgerEntry, request: UpdateLedgerEntryRequest, onDone: () => void) =>
    updateEntry.mutate(
      { entryId: entry.id, request },
      {
        onSuccess: () => {
          onDone();
          toastWithUndo("Registro atualizado.", () =>
            updateEntry.mutate({ entryId: entry.id, request: toUpdateRequest(entry) })
          );
        },
      }
    );

  const remove = (entry: LedgerEntry) =>
    removeEntry.mutate(entry.id, {
      onSuccess: () => toastWithUndo("Registro excluído.", () => restoreEntry.mutate(entry)),
    });

  return { create, update, remove, isPending: createEntry.isPending || updateEntry.isPending };
}
