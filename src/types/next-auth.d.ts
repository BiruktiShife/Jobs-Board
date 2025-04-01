// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "JOB_SEEKER" | "COMPANY_ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "JOB_SEEKER" | "COMPANY_ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "JOB_SEEKER" | "COMPANY_ADMIN";
  }
}
