/**
 * auth.ts — Denoise X client-side auth utilities
 * ------------------------------------------------
 * Token storage, API calls, and session helpers.
 */

function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}
const TOKEN_KEY = "denoisex_token";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface UserPublic {
  id: string;
  full_name: string;
  email: string;
  profile_type: string;
  college_name?: string | null;
  professional_role?: string | null;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

export interface SignUpData {
  full_name: string;
  email: string;
  password: string;
  profile_type: string;
  college_name?: string;
  professional_role?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// ── Token helpers ──────────────────────────────────────────────────────────────
export function saveToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    // Decode JWT payload (no verification — just check expiry client-side)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// ── API calls ──────────────────────────────────────────────────────────────────
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  const res = await fetch(`${getApiUrl()}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Sign up failed." }));
    throw new Error(err.detail || "Sign up failed.");
  }
  return res.json();
}

export async function signIn(data: SignInData): Promise<AuthResponse> {
  const res = await fetch(`${getApiUrl()}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Sign in failed." }));
    throw new Error(err.detail || "Sign in failed.");
  }
  return res.json();
}

export async function getMe(): Promise<UserPublic | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${getApiUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function signOut(): void {
  clearToken();
}

// ── Role labels (for display) ─────────────────────────────────────────────────
export const PROFESSIONAL_ROLE_LABELS: Record<string, string> = {
  pg_resident:   "Postgraduate Resident (MD/MS)",
  junior_doctor: "Junior Doctor / Intern",
  fellow:        "Fellow / Senior Resident",
  educator:      "Educator / Faculty",
};
