import { useMutation } from "@tanstack/react-query";
import type {
  CreateCustomerProjectRequest,
  CustomerProject,
  UpdateCustomerProjectRequest,
} from "@vetra/contracts";
import { toast } from "sonner";

import { customersMockApi } from "@/shared/mocks/customersMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export const toProjectRequest = ({
  name,
  status,
  valueInCents,
  startedAt,
}: CustomerProject): UpdateCustomerProjectRequest => ({ name, status, valueInCents, startedAt });

export function useCustomerProjectActions(customerId: string) {
  const invalidate = useInvalidateAfterLeadChange();
  const onError = (error: unknown) =>
    toast.error(getErrorMessage(error, "Não foi possível salvar o projeto."));

  const deleteRequest = (projectId: string) =>
    customersMockApi.deleteCustomerProject(customerId, projectId);

  // Undoing a creation: the project just goes away, no toast.
  const discardProject = useMutation({
    mutationFn: deleteRequest,
    onSuccess: invalidate,
    onError,
  });

  // The toast is shown here and not in the caller: the card that started the deletion is gone
  // once the projects refetch, and its callbacks would never run.
  const deleteProject = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      toast.success("Projeto excluído.");
      return invalidate();
    },
    onError,
  });

  const createProject = useMutation({
    mutationFn: (request: CreateCustomerProjectRequest) =>
      customersMockApi.createCustomerProject(customerId, request),
    onSuccess: invalidate,
    onError,
  });

  const updateProject = useMutation({
    mutationFn: ({
      projectId,
      request,
    }: {
      projectId: string;
      request: UpdateCustomerProjectRequest;
    }) => customersMockApi.updateCustomerProject(customerId, projectId, request),
    onSuccess: invalidate,
    onError,
  });

  const create = (request: CreateCustomerProjectRequest, onDone: () => void) =>
    createProject.mutate(request, {
      onSuccess: (project) => {
        onDone();
        toastWithUndo("Projeto criado.", () => discardProject.mutate(project.id));
      },
    });

  const update = (
    project: CustomerProject,
    request: UpdateCustomerProjectRequest,
    message: string,
    onDone?: () => void
  ) =>
    updateProject.mutate(
      { projectId: project.id, request },
      {
        onSuccess: () => {
          onDone?.();
          toastWithUndo(message, () =>
            updateProject.mutate({ projectId: project.id, request: toProjectRequest(project) })
          );
        },
      }
    );

  const remove = (project: CustomerProject, onDone: () => void) =>
    deleteProject.mutate(project.id, { onSuccess: onDone });

  return {
    create,
    update,
    remove,
    isSaving: createProject.isPending || updateProject.isPending,
    isRemoving: deleteProject.isPending,
  };
}
