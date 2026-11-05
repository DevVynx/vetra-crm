import { leadsTable, sql } from "@vetra/database";

import { canonicalPhoneOf } from "../../../shared/phone";

// Messages exchanged before the lead existed, or before it got this number, count as contact.
export const lastMessageAtOfPhoneKey = (phoneKey: string) =>
  sql<Date | null>`(select max(c.last_message_at) from whatsapp_conversations c where c.phone_key = ${phoneKey})`;

// Every edit of a phone goes through here, so the key can't fall out of step with the number.
export function contactChangeOf<Contact extends { phone: string }>(contact: Contact) {
  const phoneKey = canonicalPhoneOf(contact.phone);

  return {
    ...contact,
    phoneKey,
    lastContactAt: sql<Date | null>`greatest(${leadsTable.lastContactAt}, ${lastMessageAtOfPhoneKey(phoneKey)})`,
  };
}
