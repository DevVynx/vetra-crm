import { useMutation } from "@tanstack/react-query";
import type {
  CreateLedgerEntryRequest,
  CreateLedgerEntryResponse,
  LedgerEntry,
  UpdateLedgerEntryRequest,
  UpdateLedgerEntryResponse,
} from "@vetra/contracts";
import { buildPath, ledgerRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

const toUpdateRequest = ({
  description,
  amountInCents,
  status,
  occurredAt,
  projectId,
}: LedgerEntry): UpdateLedgerEntryRequest => ({
  description,
  amountInCents,
  status,
  occurredAt,
  projectId,
});

export function useLedgerEntryActions(customerId: string) {
  const invalidate = useInvalidateAfterLeadChange();
  const onError = (error: unknown) =>
    toast.error(getErrorMessage(error, "Não foi possível salvar o registro."));

  const restoreEntry = useMutation({
    mutationFn: (entry: LedgerEntry) =>
      api.post(buildPath(ledgerRoutes.restore, { id: customerId }), entry),
    onSuccess: invalidate,
    onError,
  });

  // Undoing a creation: the entry just goes away, no toast.
  const discardEntry = useMutation({
    mutationFn: (entryId: string) =>
      api.delete(buildPath(ledgerRoutes.byId, { id: customerId, entryId })),
    onSuccess: invalidate,
    onError,
  });

  // The undo toast is shown here and not in the caller: the row that started the deletion is
  // gone once the ledger refetches, and its callbacks would never run.
  const deleteEntry = useMutation({
    mutationFn: (entry: LedgerEntry) =>
      api.delete(buildPath(ledgerRoutes.byId, { id: customerId, entryId: entry.id })),
    onSuccess: (_, entry) => {
      toastWithUndo("Registro excluído com sucesso.", () => restoreEntry.mutate(entry));
      return invalidate();
    },
    onError,
  });

  const createEntry = useMutation({
    mutationFn: async (request: CreateLedgerEntryRequest) =>
      (
        await api.post<CreateLedgerEntryResponse>(
          buildPath(ledgerRoutes.byCustomer, { id: customerId }),
          request
        )
      ).data,
    onSuccess: invalidate,
    onError,
  });

  const updateEntry = useMutation({
    mutationFn: async ({
      entryId,
      request,
    }: {
      entryId: string;
      request: UpdateLedgerEntryRequest;
    }) =>
      (
        await api.patch<UpdateLedgerEntryResponse>(
          buildPath(ledgerRoutes.byId, { id: customerId, entryId }),
          request
        )
      ).data,
    onSuccess: invalidate,
    onError,
  });

  const create = (request: CreateLedgerEntryRequest, onDone: () => void) =>
    createEntry.mutate(request, {
      onSuccess: (entry) => {
        onDone();
        toastWithUndo("Registro criado com sucesso.", () => discardEntry.mutate(entry.id));
      },
    });

  const update = (entry: LedgerEntry, request: UpdateLedgerEntryRequest, onDone: () => void) =>
    updateEntry.mutate(
      { entryId: entry.id, request },
      {
        onSuccess: () => {
          onDone();
          toastWithUndo("Registro atualizado com sucesso.", () =>
            updateEntry.mutate({ entryId: entry.id, request: toUpdateRequest(entry) })
          );
        },
      }
    );

  const remove = (entry: LedgerEntry) => deleteEntry.mutate(entry);

  return { create, update, remove, isPending: createEntry.isPending || updateEntry.isPending };
}
