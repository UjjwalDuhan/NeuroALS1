const TOKEN_KEY = "neuroals_token";
const USER_KEY = "neuroals_user";

// ── Token ─────────────────────────────────────────────────────────────────────
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// ── User ──────────────────────────────────────────────────────────────────────
export const getStoredUser = <T>(): T | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const setStoredUser = <T>(user: T): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// ── Clear all auth data ───────────────────────────────────────────────────────
export const clearAuthStorage = (): void => {
  removeStoredToken();
  removeStoredUser();
};
