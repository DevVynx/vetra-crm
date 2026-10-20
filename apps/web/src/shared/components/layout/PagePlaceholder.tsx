export function PagePlaceholder({ description }: { description: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
