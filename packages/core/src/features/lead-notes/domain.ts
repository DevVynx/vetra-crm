import { v7 as uuidv7 } from "uuid";

export type LeadNote = {
  id: string;
  leadId: string;
  content: string;
  createdAt: Date;
};

function create(leadId: string, content: string, now: Date): LeadNote {
  return { id: uuidv7(), leadId, content, createdAt: now };
}

export const leadNoteDomain = { create };
