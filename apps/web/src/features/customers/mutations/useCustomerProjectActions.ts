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

  const removeProject = useMutation({
    mutationFn: (projectId: string) =>
      customersMockApi.deleteCustomerProject(customerId, projectId),
    onSuccess: invalidate,
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
        toastWithUndo("Projeto criado.", () => removeProject.mutate(project.id));
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
    removeProject.mutate(project.id, {
      onSuccess: () => {
        onDone();
        toast.success("Projeto excluído.");
      },
    });

  return {
    create,
    update,
    remove,
    isSaving: createProject.isPending || updateProject.isPending,
    isRemoving: removeProject.isPending,
  };
}
