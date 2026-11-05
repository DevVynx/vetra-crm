import { wahaClient, type WahaContact, WahaUnavailableError } from "@vetra/infra";

import { whatsappDomain } from "../domain";

const CONTACTS_PAGE_SIZE = 500;

type AgendaEntry = {
  savedName: string | null;
  profileName: string | null;
};

// By phone key: a contact can be listed under an id with the ninth digit and the chat without it.
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
async function phoneKeyOfContact(contact: WahaContact, savedName: string | null) {
  const phoneKey = whatsappDomain.phoneKeyOfChatId(contact.id);
  if (phoneKey) return phoneKey;
  if (!whatsappDomain.isLidChat(contact.id)) return null;

  if (contact.number) return whatsappDomain.canonicalPhoneOf(contact.number);
  if (!savedName) return null;

  const phoneId = await wahaClient.getPhoneIdOfLid(contact.id);

  return phoneId ? whatsappDomain.phoneKeyOfChatId(phoneId) : null;
}

// Null when it couldn't be read: names are a nicety, and must not stop the messages from syncing.
export async function loadAgenda(): Promise<Agenda | null> {
  try {
    const agenda: Agenda = new Map();

    for (const contact of await fetchAllContacts()) {
      const savedName = whatsappDomain.savedNameOfContact(contact);
      const phoneKey = await phoneKeyOfContact(contact, savedName);
      if (!phoneKey) continue;

      const known = agenda.get(phoneKey);
      agenda.set(phoneKey, {
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
