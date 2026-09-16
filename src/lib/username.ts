import { prisma } from "./prisma";

export const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "builder",
  "login",
  "register",
  "signin",
  "signout",
  "settings",
  "links",
  "themes",
  "profile",
  "onboarding",
  "public",
  "static",
  "_next",
  "favicon",
  "sitemap",
  "robots",
  "r", // redirect shortlink handler
]);

export function sanitizeUsername(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 20);
}

export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 3) {
    return { valid: false, error: "Username minimal 3 karakter." };
  }
  if (username.length > 20) {
    return { valid: false, error: "Username maksimal 20 karakter." };
  }
  if (!/^[a-z0-9_-]+$/.test(username)) {
    return { valid: false, error: "Hanya huruf kecil, angka, garis bawah (_), dan tanda minus (-) diperbolehkan." };
  }
  if (RESERVED_USERNAMES.has(username)) {
    return { valid: false, error: `Username '${username}' adalah kata kunci sistem yang dicadangkan.` };
  }
  return { valid: true };
}

export async function isUsernameAvailable(
  username: string,
  excludeUserId?: string
): Promise<{ available: boolean; error?: string }> {
  const formatCheck = validateUsernameFormat(username);
  if (!formatCheck.valid) {
    return { available: false, error: formatCheck.error };
  }

  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (existing && existing.id !== excludeUserId) {
    return { available: false, error: "Username sudah digunakan oleh orang lain." };
  }

  return { available: true };
}

export async function generateUniqueUsername(baseSuggestion: string): Promise<string> {
  const base = sanitizeUsername(baseSuggestion) || "user";
  let candidate = base.length < 3 ? `${base}123` : base;

  let counter = 1;
  while (true) {
    if (!RESERVED_USERNAMES.has(candidate)) {
      const existing = await prisma.user.findUnique({
        where: { username: candidate },
        select: { id: true },
      });
      if (!existing) {
        return candidate;
      }
    }
    candidate = `${base.slice(0, 15)}${counter}`;
    counter++;
  }
}
