import { validation } from "@/shared/http/validation";

const v = {
  exportData: validation({}),
  previewImport: validation({}),
  importData: validation({}),
};

export default v;
