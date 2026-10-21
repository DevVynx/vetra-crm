type TooltipRowProps = {
  label: string;
  color?: string;
  value: string;
};

export function TooltipRow({ label, color, value }: TooltipRowProps) {
  return (
    <div className="flex w-full items-center gap-2">
      {color && (
        <span
          aria-hidden
          className="h-2.5 w-1 shrink-0 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground ml-auto font-medium tabular-nums">{value}</span>
    </div>
  );
}
