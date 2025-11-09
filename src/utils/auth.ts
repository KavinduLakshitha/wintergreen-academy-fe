export const isClient = typeof window !== "undefined";

const AUTH_STORAGE_KEYS = ["token", "user"] as const;

const clearAuthStorage = () => {
  if (!isClient) return;
  AUTH_STORAGE_KEYS.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage errors (e.g., private mode or disabled storage)
    }
  });
};

export const isUnauthorizedStatus = (status: number) => status === 401 || status === 403;

export const signOutAndRedirect = () => {
  if (!isClient) return;

  clearAuthStorage();

  if (window.location.pathname !== "/") {
    window.location.href = "/";
  }
};

export const isUnauthorizedError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const maybeStatus = (error as { status?: number }).status;
  return typeof maybeStatus === "number" && isUnauthorizedStatus(maybeStatus);
};

