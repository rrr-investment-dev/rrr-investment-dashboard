// src/routes/authLoaders.ts
import { redirect } from "react-router-dom";
import { api } from "@/http/api";

export const requireAuthLoader = async () => {
  try {
    await api.get("/auth/me", {
      headers: { "x-loading-bar": "off" },
    });
    return null;
  } catch {
    // If there's an error (e.g., 401 Unauthorized), redirect to the login page
    return redirect("/login");
  }
};

export const redirectIfAuthenticated = async () => {
  try {
    await api.get("/auth/me", {
      headers: { "x-loading-bar": "off" },
    });

    return redirect("/dashboard"); // must return only redirect(...)
  } catch {
    return null; // allowed
  }
};

export const rootRedirectLoader = async () => {
  try {
    await api.get("/auth/me", {
      headers: { "x-loading-bar": "off" },
    });
    return redirect("/dashboard");
  } catch {
    return redirect("/login"); // 👈 always changes URL
  }
};
