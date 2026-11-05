import { Button } from "@/shared/components/ui/button";

type MediaProblemProps = {
  message: string;
  onRetry: () => void;
};

export function MediaProblem({ message, onRetry }: MediaProblemProps) {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
      <span>{message}</span>
      <Button size="xs" variant="outline" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  );
}
