import { DefaultSession } from "next-auth";

export type UserRole = "USER" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      role?: UserRole | string;
      status?: UserStatus | string;
      themeBackground?: string;
      themeAccent?: string;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string | null;
    role?: UserRole | string;
    status?: UserStatus | string;
    themeBackground?: string;
    themeAccent?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    username?: string | null;
    role?: UserRole | string;
    status?: UserStatus | string;
    themeBackground?: string;
    themeAccent?: string;
  }
}
