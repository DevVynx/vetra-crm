import type { Filter } from "../../../shared/filters";
import type { Sort } from "../../../shared/sort";
import { getProfile } from "../../profile/services/getProfile";
import { type CustomerListRow, customerRepositories } from "../repositories";

type listCustomersInput = {
  search: string;
  filters: Filter[];
  sort: Sort | undefined;
  page: number;
  pageSize: number;
};

export async function listCustomers({
  search,
  filters,
  sort,
  page,
  pageSize,
}: listCustomersInput): Promise<{
  items: CustomerListRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const profile = await getProfile();
  const result = await customerRepositories.findCustomersPage({
    search,
    filters,
    sort,
    timeZone: profile.timeZone,
    page,
    pageSize,
  });
  return { ...result, pageSize };
}
