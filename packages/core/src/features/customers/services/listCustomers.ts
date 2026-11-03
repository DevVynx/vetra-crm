import type { Filter } from "../../../shared/filters";
import { getProfile } from "../../profile/services/getProfile";
import { type CustomerListRow, customerRepositories } from "../repositories";

type listCustomersInput = {
  search: string;
  filters: Filter[];
  page: number;
  pageSize: number;
};

export async function listCustomers({
  search,
  filters,
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
    timeZone: profile.timeZone,
    page,
    pageSize,
  });
  return { ...result, pageSize };
}
