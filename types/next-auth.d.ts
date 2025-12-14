import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      avatarUrl: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    role: string;
    avatarUrl: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    avatarUrl: string;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    id: string;
    username: string;
    role: string;
    avatarUrl: string;
  }
}
