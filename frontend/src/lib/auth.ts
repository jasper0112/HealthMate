export type AuthUser = {
  userId: number;
  username: string;
  email: string;
  fullName?: string | null;
  role: "USER" | "ADMIN" | "DOCTOR";
};

const KEY = "healthmate.currentUser";

export function setCurrentUser(user: AuthUser) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {}
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}


