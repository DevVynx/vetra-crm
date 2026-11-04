import { searchQuerySchema } from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  searchRecords: validation({ query: searchQuerySchema }),
};

export default v;
