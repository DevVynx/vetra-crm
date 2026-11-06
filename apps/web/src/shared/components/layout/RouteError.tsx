import { useQueryClient } from "@tanstack/react-query";
import { type ErrorComponentProps, Link } from "@tanstack/react-router";
import { TriangleAlertIcon } from "lucide-react";

import { Button, buttonVariants } from "@/shared/components/ui/button";

// What a screen shows when its own code fails, instead of a blank page.
export function RouteError({ reset }: ErrorComponentProps) {
  const queryClient = useQueryClient();

  // What a screen drew from may be what broke it, and the cache keeps it for minutes, so trying
  // again starts from what the server says now.
  const retry = () => {
    queryClient.clear();
    reset();
  };

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center"
    >
      <div className="bg-muted flex size-12 items-center justify-center rounded-xl">
        <TriangleAlertIcon className="text-muted-foreground size-6" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-semibold">Algo deu errado nesta tela</h1>
        <p className="text-muted-foreground text-sm">
          Tente de novo. Se o problema continuar, volte ao Painel.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={retry}>Tentar de novo</Button>
        <Link to="/" className={buttonVariants({ variant: "outline" })}>
          Voltar ao Painel
        </Link>
      </div>
    </div>
  );
}
