import { v7 as uuidv7 } from "uuid";

export type Profile = {
  id: string;
  name: string;
  timeZone: string;
};

export type ProfileChanges = Partial<Pick<Profile, "name" | "timeZone">>;

const DEFAULT_NAME = "Maria Souza";
const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

function createDefault(): Profile {
  return { id: uuidv7(), name: DEFAULT_NAME, timeZone: DEFAULT_TIME_ZONE };
}

function applyChanges(profile: Profile, changes: ProfileChanges): Profile {
  return {
    ...profile,
    name: changes.name ?? profile.name,
    timeZone: changes.timeZone ?? profile.timeZone,
  };
}

export const profileDomain = { createDefault, applyChanges };
