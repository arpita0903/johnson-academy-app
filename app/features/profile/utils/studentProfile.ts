export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

export const REFERRAL_SOURCES = [
  { value: "friend_or_family", label: "Friend or family" },
  { value: "social_media", label: "Social media" },
  { value: "google", label: "Google" },
  { value: "website", label: "Website" },
  { value: "walk_in", label: "Walk-in" },
  { value: "advertisement", label: "Advertisement" },
  { value: "existing_student", label: "Existing student" },
  { value: "other", label: "Other" },
] as const;

export type Gender = (typeof GENDERS)[number]["value"];
export type ReferralSource = (typeof REFERRAL_SOURCES)[number]["value"];

export type StudentProfileFields = {
  role?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  occupation?: string | null;
  referralSource?: string | null;
  referralSourceOther?: string | null;
  address?: string | null;
  emergencyContact?: { phone?: string | null } | null;
  profilePicture?: string | null;
  motherName?: string | null;
  fatherName?: string | null;
  isProfileCardComplete?: boolean | null;
};

export const PARENT_DETAILS_MAX_AGE = 15;

export function ageFromDateOfBirth(
  value?: string | null,
  today = new Date(),
): number | null {
  const key = toDateKey(value);
  if (!key) return null;
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return null;
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) {
    age -= 1;
  }
  return age;
}

export function requiresParentDetails(
  value?: string | null,
  today = new Date(),
): boolean {
  const age = ageFromDateOfBirth(value, today);
  return age != null && age <= PARENT_DETAILS_MAX_AGE;
}

/** Admission is done, and the profile card is missing or no longer valid. */
export function needsProfileCardUpdate(user: StudentProfileFields): boolean {
  if (user.role && user.role !== "student") return false;
  if (!isStudentProfileComplete(user)) return false;
  if (!user.isProfileCardComplete) return true;
  if (!user.profilePicture?.trim()) return true;
  if (requiresParentDetails(user.dateOfBirth)) {
    return !user.motherName?.trim() || !user.fatherName?.trim();
  }
  return false;
}

const GENDER_VALUES: readonly string[] = GENDERS.map((option) => option.value);
const REFERRAL_VALUES: readonly string[] = REFERRAL_SOURCES.map(
  (option) => option.value,
);

export function toDateKey(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match?.[1] ?? "";
}

export function formatProfileDate(value?: string | null): string {
  const key = toDateKey(value);
  if (!key) return "";
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function genderLabel(value?: string | null): string {
  return GENDERS.find((option) => option.value === value)?.label ?? "";
}

export function referralLabel(value?: string | null): string {
  return REFERRAL_SOURCES.find((option) => option.value === value)?.label ?? "";
}

export function isStudentProfileComplete(user: StudentProfileFields): boolean {
  if (user.role && user.role !== "student") return true;
  const otherOk =
    user.referralSource !== "other" ||
    Boolean(user.referralSourceOther?.trim());
  const phoneDigits = (user.emergencyContact?.phone ?? "").replace(/\D/g, "");
  return Boolean(
    toDateKey(user.dateOfBirth) &&
      user.gender &&
      GENDER_VALUES.includes(user.gender) &&
      user.occupation?.trim() &&
      user.referralSource &&
      REFERRAL_VALUES.includes(user.referralSource) &&
      otherOk &&
      user.address?.trim() &&
      phoneDigits.length >= 8,
  );
}
