import { v7 as uuidv7 } from "uuid";

export type Profile = {
  id: string;
  name: string;
  timeZone: string;
  onboardedAt: Date | null;
};

export type ProfileWithPhoto = Profile & { photoVersion: number | null; isOnboarded: boolean };

export type ProfileChanges = Partial<Pick<Profile, "name" | "timeZone">>;

const PROFILE_PHOTO_MAX_BYTES = 512 * 1024;

const DEFAULT_NAME = "Maria Souza";
const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

function createDefault(): Profile {
  return { id: uuidv7(), name: DEFAULT_NAME, timeZone: DEFAULT_TIME_ZONE, onboardedAt: null };
}

function applyChanges(profile: Profile, changes: ProfileChanges): Profile {
  return {
    ...profile,
    name: changes.name ?? profile.name,
    timeZone: changes.timeZone ?? profile.timeZone,
  };
}

// The file header says what it is, not its name or the type the sender claims.
function isProfilePhoto(content: Buffer): boolean {
  return (
    content.length > 0 &&
    content.length <= PROFILE_PHOTO_MAX_BYTES &&
    content.subarray(0, 4).toString("ascii") === "RIFF" &&
    content.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

// Finishing the introduction sets the two answers and the date. Seeing it again only changes the
// answers: the date stays the one of the first time.
function completeOnboarding(profile: Profile, answers: ProfileChanges, now: Date): Profile {
  return { ...applyChanges(profile, answers), onboardedAt: profile.onboardedAt ?? now };
}

const withPhoto = (profile: Profile, photoVersion: number | null): ProfileWithPhoto => ({
  ...profile,
  photoVersion,
  isOnboarded: profile.onboardedAt !== null,
});

export const profileDomain = {
  createDefault,
  applyChanges,
  completeOnboarding,
  isProfilePhoto,
  withPhoto,
};
