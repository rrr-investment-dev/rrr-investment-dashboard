// src/routes/authBootstrap.ts
import { api } from "@/http/api";

export type AuthState = "unknown" | "authenticated" | "unauthenticated";

let authState: AuthState = "unknown";

export const bootstrapAuth = async (): Promise<AuthState> => {
  if (authState !== "unknown") {
    return authState;
  }

  try {
    await api.get("/auth/me", {
      headers: { "x-loading-bar": "off" },
    });

    authState = "authenticated";
  } catch {
    authState = "unauthenticated";
  }

  return authState;
};

export const resetAuthState = () => {
  authState = "unknown";
};
