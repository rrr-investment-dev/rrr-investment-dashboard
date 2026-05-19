// main.tsx
import { StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRouter as router } from "./routes/AppRouter";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { LoadingBarContainer, useLoadingBar } from "react-top-loading-bar";
import { api } from "@/http/api";
import { AuthProvider } from "./auth/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes: data stays "fresh" and won't refetch automatically
      gcTime: 1000 * 60 * 30,    // 30 minutes: keep data in cache even if not active
      refetchOnWindowFocus: false, // Prevents aggressive refetching when switching browser tabs
      retry: 1, // Only retry once to fail faster if there's a real server error
    },
  },
});

/**
 * Component that wires react-top-loading-bar to Axios via interceptors.
 * Uses a local ref `inflightRef` to count concurrent requests.
 */
// eslint-disable-next-line react-refresh/only-export-components
function LoadingBarInterceptor() {
  const { start, complete } = useLoadingBar();
  const inflightRef = useRef(0);

  useEffect(() => {
    // Request interceptor
    const reqId = api.interceptors.request.use(
      (config) => {
        // allow opt-out per-request
        const skip =
          config.headers &&
          (config.headers as never)["x-loading-bar"] === "off";
        if (!skip) {
          if (inflightRef.current === 0) start();
          inflightRef.current += 1;
        }
        return config;
      },
      (error) => {
        // nothing started - ensure we don't leave counter wrong
        return Promise.reject(error);
      },
    );

    // Response interceptor
    const resId = api.interceptors.response.use(
      (response) => {
        const skip =
          response.config.headers &&
          (response.config.headers as never)["x-loading-bar"] === "off";
        if (!skip) {
          inflightRef.current = Math.max(0, inflightRef.current - 1);
          if (inflightRef.current === 0) complete();
        }
        return response;
      },
      (error) => {
        const cfg = error?.config;
        const skip = cfg && (cfg.headers as never)["x-loading-bar"] === "off";
        if (!skip) {
          inflightRef.current = Math.max(0, inflightRef.current - 1);
          if (inflightRef.current === 0) complete();
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, [start, complete]);

  return null;
}

import { ThemeProvider, useTheme } from "@/components/theme-provider";

function AppToaster() {
  try {
    const { theme } = useTheme();
    const resolvedTheme = theme === "system"
      ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    return <Toaster position="bottom-right" richColors closeButton theme={resolvedTheme} />;
  } catch (error) {
    console.error("AppToaster theme error, falling back:", error);
    return <Toaster position="bottom-right" richColors closeButton />;
  }
}

export function Root() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="rrr-dashboard-theme">
      <LoadingBarContainer props={{ color: "#4F46E5", height: 3 }}>
        {/* This invisible component hooks axios -> loading bar */}
        <LoadingBarInterceptor />

        <QueryClientProvider client={queryClient}>
          <AppToaster />
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </LoadingBarContainer>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
