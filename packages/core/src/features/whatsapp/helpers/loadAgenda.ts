import { wahaClient, type WahaContact, WahaUnavailableError } from "@vetra/infra";

import { whatsappDomain } from "../domain";

const CONTACTS_PAGE_SIZE = 500;

type AgendaEntry = {
  savedName: string | null;
  profileName: string | null;
};

export type Agenda = Map<string, AgendaEntry>;

async function fetchAllContacts(): Promise<WahaContact[]> {
  const contacts: WahaContact[] = [];

  for (let offset = 0; ; offset += CONTACTS_PAGE_SIZE) {
    const page = await wahaClient.getContacts(CONTACTS_PAGE_SIZE, offset);
    contacts.push(...page);

    if (page.length < CONTACTS_PAGE_SIZE) return contacts;
  }
}

// A saved contact can be listed only under its hidden @lid id, while conversations use the phone.
// Only those are looked up, one by one: a lookup for each of the thousands of contacts isn't worth
// it for a name the person gave their own profile.
async function chatIdOfContact(contact: WahaContact, savedName: string | null) {
  const phone = whatsappDomain.phoneOfChatId(contact.id);
  if (phone) return whatsappDomain.chatIdOfPhone(phone);
  if (!whatsappDomain.isLidChat(contact.id)) return null;

  if (contact.number) return whatsappDomain.chatIdOfPhone(contact.number.replace(/\D/g, ""));
  if (!savedName) return null;

  const phoneId = await wahaClient.getPhoneIdOfLid(contact.id);
  const resolved = phoneId ? whatsappDomain.phoneOfChatId(phoneId) : null;

  return resolved ? whatsappDomain.chatIdOfPhone(resolved) : null;
}

// Null when it couldn't be read: names are a nicety, and must not stop the messages from syncing.
export async function loadAgenda(): Promise<Agenda | null> {
  try {
    const agenda: Agenda = new Map();

    for (const contact of await fetchAllContacts()) {
      const savedName = whatsappDomain.savedNameOfContact(contact);
      const chatId = await chatIdOfContact(contact, savedName);
      if (!chatId) continue;

      const known = agenda.get(chatId);
      agenda.set(chatId, {
        savedName: savedName ?? known?.savedName ?? null,
        profileName: contact.pushname?.trim() || known?.profileName || null,
      });
    }

    return agenda;
  } catch (error) {
    if (error instanceof WahaUnavailableError) return null;
    throw error;
  }
}
