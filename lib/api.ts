// frontend/lib/api.ts
// Auth-aware fetch wrapper for the Django REST + simplejwt backend.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

// ---------- Token storage (localStorage, browser only) ----------
export const tokens = {
  get access(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;
  },
  get refresh(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
  },
  set(access: string, refresh?: string) {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export function isLoggedIn(): boolean {
  return !!tokens.access;
}

// ---------- Login / logout ----------
export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Invalid username or password");
  const data = await res.json();
  tokens.set(data.access, data.refresh);
}

export function logout(): void {
  tokens.clear();
  if (typeof window !== "undefined") window.location.href = "/login";
}

// ---------- Token refresh (one refresh at a time) ----------
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokens.refresh;
  if (!refresh) return null;

  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    tokens.clear();
    return null;
  }
  const data = await res.json();
  // data.refresh only exists if ROTATE_REFRESH_TOKENS is on in settings.py
  tokens.set(data.access, data.refresh);
  return data.access;
}

// ---------- The wrapper: use this instead of fetch() ----------
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const send = (token: string | null) => {
    const headers = new Headers(options.headers);
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_URL}${path}`, { ...options, headers });
  };

  let res = await send(tokens.access);

  // Access token expired -> refresh once, then retry the same request
  if (res.status === 401 && tokens.refresh) {
    refreshing ??= refreshAccessToken().finally(() => {
      refreshing = null;
    });
    const newToken = await refreshing;

    if (newToken) {
      res = await send(newToken);
    } else if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return res;
}

// ---------- Example usage ----------
// import { apiFetch } from "@/lib/api";
// const res = await apiFetch("/api/bookings/", {
//   method: "POST",
//   body: JSON.stringify({ machinery: 1, start_date: "2026-11-01", end_date: "2026-11-03" }),
// });
// if (!res.ok) { const err = await res.json(); /* show conflict error */ }