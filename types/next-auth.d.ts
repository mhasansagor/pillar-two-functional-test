import type { DefaultSession, DefaultUser } from "next-auth";

export type UserRole = "admin" | "manager";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: UserRole;
  }

  interface Session {
    user: {
      role?: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}
