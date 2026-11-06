import { useQueryClient } from "@tanstack/react-query";
import { ServerOffIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { useConnectionStore } from "@/shared/connection/connectionStore";
import { isServerReachable } from "@/shared/connection/serverCheck";

const RETRY_INTERVAL_MS = 4_000;

// In place of the screens while the server doesn't answer. It asks again by itself, and when the
// server is back the data is loaded again and the screens return.
export function ConnectionLostNotice() {
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async () => {
    setIsChecking(true);
    const isBack = await isServerReachable();
    setIsChecking(false);
    if (!isBack) return;

    useConnectionStore.setState({ isLost: false });
    void queryClient.invalidateQueries();
  }, [queryClient]);

  useEffect(() => {
    const timer = window.setInterval(() => void check(), RETRY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [check]);

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center"
    >
      <div className="bg-muted flex size-12 items-center justify-center rounded-xl">
        <ServerOffIcon className="text-muted-foreground size-6" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-semibold">Não consegui falar com o servidor do Vetra</h1>
        <p className="text-muted-foreground text-sm">
          Confira se o Vetra está rodando e se o Docker está ligado. Assim que ele voltar, esta tela
          se atualiza sozinha.
        </p>
      </div>
      <Button variant="outline" disabled={isChecking} onClick={() => void check()}>
        {isChecking && <Spinner />}
        Tentar de novo
      </Button>
    </div>
  );
}
