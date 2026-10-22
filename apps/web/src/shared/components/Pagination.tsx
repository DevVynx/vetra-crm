import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { pluralize } from "@/shared/utils/format";

const NEIGHBOR_PAGES = 2;

type PageItem = { type: "page"; page: number } | { type: "gap"; key: string };

function buildPageItems(page: number, totalPages: number): PageItem[] {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (candidate) =>
      candidate === 1 || candidate === totalPages || Math.abs(candidate - page) <= NEIGHBOR_PAGES
  );

  return pages.flatMap((candidate, index): PageItem[] => {
    const previous = pages[index - 1];
    const missing = previous === undefined ? 0 : candidate - previous - 1;
    const items: PageItem[] = [];

    if (previous !== undefined && missing === 1) items.push({ type: "page", page: previous + 1 });
    if (missing > 1) items.push({ type: "gap", key: `gap-${candidate}` });
    items.push({ type: "page", page: candidate });
    return items;
  });
}

type GapJumpProps = { totalPages: number; onJump: (page: number | null) => void };

function GapJump({ totalPages, onJump }: GapJumpProps) {
  return (
    <Input
      type="number"
      min={1}
      max={totalPages}
      autoFocus
      placeholder="…"
      aria-label="Ir para a página"
      className="h-7 w-14 [appearance:textfield] px-1 text-center [&::-webkit-inner-spin-button]:appearance-none"
      onBlur={() => onJump(null)}
      onKeyDown={(event) => {
        if (event.key === "Escape") onJump(null);
        if (event.key !== "Enter") return;
        const target = Number(event.currentTarget.value);
        onJump(target >= 1 && target <= totalPages ? target : null);
      }}
    />
  );
}

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  noun: { singular: string; plural: string };
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageSize, total, noun, onPageChange }: PaginationProps) {
  const [editingGap, setEditingGap] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const jump = (target: number | null) => {
    if (target !== null) onPageChange(target);
    setEditingGap(null);
  };

  return (
    <div className="grid items-center gap-2 text-sm sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
      <span className="text-muted-foreground order-last text-center sm:order-none sm:text-left">
        {pluralize(total, noun.singular, noun.plural)}
      </span>

      {totalPages > 1 && (
        <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon />
            Anterior
          </Button>

          {buildPageItems(page, totalPages).map((item) =>
            item.type === "gap" ? (
              editingGap === item.key ? (
                <GapJump key={item.key} totalPages={totalPages} onJump={jump} />
              ) : (
                <Button
                  key={item.key}
                  size="sm"
                  variant="ghost"
                  className="min-w-7"
                  aria-label="Ir para uma página"
                  onClick={() => setEditingGap(item.key)}
                >
                  …
                </Button>
              )
            ) : (
              <Button
                key={item.page}
                size="sm"
                variant={item.page === page ? "default" : "outline"}
                aria-current={item.page === page ? "page" : undefined}
                className="min-w-7 tabular-nums"
                onClick={() => onPageChange(item.page)}
              >
                {item.page}
              </Button>
            )
          )}

          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Próximo
            <ChevronRightIcon />
          </Button>
        </nav>
      )}
      <div aria-hidden className="hidden sm:block" />
    </div>
  );
}
