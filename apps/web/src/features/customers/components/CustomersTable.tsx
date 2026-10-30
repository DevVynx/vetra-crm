import { Link, useNavigate } from "@tanstack/react-router";
import type { CustomerListItem } from "@vetra/contracts";
import { useEffect } from "react";

import { BusinessAvatar } from "@/shared/components/BusinessAvatar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/utils/cn";
import { formatRelative } from "@/shared/utils/date";
import { formatCurrency, pluralize } from "@/shared/utils/format";

const DEFAULT_SKELETON_ROWS = 6;

function ReceivedCell({ customer }: { customer: CustomerListItem }) {
  const ratio =
    customer.closedValueInCents === 0 ? 0 : customer.receivedInCents / customer.closedValueInCents;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="tabular-nums">{formatCurrency(customer.receivedInCents)}</span>
      <div className="bg-muted h-1 w-24 overflow-hidden rounded-full">
        <div className="bg-success h-full rounded-full" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

function ColumnHead({ className, children }: { className?: string; children: string }) {
  return <TableHead className={cn("font-semibold", className)}>{children}</TableHead>;
}

function TableHeaders() {
  return (
    <TableHeader>
      <TableRow>
        <ColumnHead className="pl-4">Cliente</ColumnHead>
        <ColumnHead className="hidden lg:table-cell">Nicho</ColumnHead>
        <ColumnHead className="hidden xl:table-cell">Cidade</ColumnHead>
        <ColumnHead>Valor fechado</ColumnHead>
        <ColumnHead>Recebido</ColumnHead>
        <ColumnHead className="hidden md:table-cell">Mensalidade</ColumnHead>
        <ColumnHead className="pr-4 xl:pr-2">Projetos</ColumnHead>
        <ColumnHead className="hidden xl:table-cell xl:w-px xl:pr-4 xl:whitespace-nowrap">
          Fechado
        </ColumnHead>
      </TableRow>
    </TableHeader>
  );
}

export function CustomersTableSkeleton({ rows }: { rows: number }) {
  return (
    <Table>
      <TableHeaders />
      <TableBody>
        {Array.from({ length: rows || DEFAULT_SKELETON_ROWS }, (_, index) => (
          <TableRow key={index}>
            <TableCell colSpan={8}>
              <Skeleton className="h-8 w-full" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type CustomersTableProps = {
  customers: CustomerListItem[];
  activeIndex: number;
  // The page has as many rows as fit: they stretch to use the leftover height.
  isFull: boolean;
};

export function CustomersTable({ customers, activeIndex, isFull }: CustomersTableProps) {
  const navigate = useNavigate();

  useEffect(() => {
    document.querySelector('tr[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <Table fillHeight={isFull}>
      <TableHeaders />
      <TableBody lastRowBorder={!isFull}>
        {customers.map((customer, index) => (
          <TableRow
            key={customer.id}
            className="data-[active=true]:bg-muted/60 cursor-pointer"
            data-active={index === activeIndex}
            onClick={() => navigate({ to: "/customers/$customerId", params: { customerId: customer.id } })}
          >
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <BusinessAvatar name={customer.businessName} className="text-xs" />
                <div className="min-w-0">
                  <Link
                    to="/customers/$customerId"
                    params={{ customerId: customer.id }}
                    className="font-medium hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {customer.businessName}
                  </Link>
                  {customer.contactName && (
                    <div className="text-muted-foreground text-xs">{customer.contactName}</div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden lg:table-cell">{customer.niche}</TableCell>
            <TableCell className="hidden xl:table-cell">{customer.city}</TableCell>
            <TableCell className="tabular-nums">
              {formatCurrency(customer.closedValueInCents)}
            </TableCell>
            <TableCell>
              <ReceivedCell customer={customer} />
            </TableCell>
            <TableCell className="hidden tabular-nums md:table-cell">
              {customer.monthlyFeeInCents ? (
                <>
                  {formatCurrency(customer.monthlyFeeInCents)}
                  <span className="text-muted-foreground text-xs">/mês</span>
                </>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="pr-4 xl:pr-2">
              <div className="flex flex-col">
                <span>{pluralize(customer.projectsCount, "projeto", "projetos")}</span>
                <span className="text-muted-foreground text-xs">
                  {customer.activeProjectsCount > 0
                    ? `${customer.activeProjectsCount} em andamento`
                    : "Nenhum em andamento"}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground hidden xl:table-cell xl:w-px xl:pr-4 xl:whitespace-nowrap">
              {formatRelative(new Date(customer.closedAt))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
