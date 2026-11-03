import { dashboardPeriodQuerySchema } from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  getSummary: validation({ query: dashboardPeriodQuerySchema }),
  getRevenue: validation({ query: dashboardPeriodQuerySchema }),
  getFunnel: validation({ query: dashboardPeriodQuerySchema }),
  getProspecting: validation({ query: dashboardPeriodQuerySchema }),
  getConversionByNiche: validation({ query: dashboardPeriodQuerySchema }),
};

export default v;
