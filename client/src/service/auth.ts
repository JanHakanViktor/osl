import type { SignUpFormValues } from "../components/auth/SignUpForm";
import type { AuthUser } from "../types/auth.types";
const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (
  data: Pick<
    SignUpFormValues,
    "username" | "password" | "drivername" | "country" | "teamId"
  >
): Promise<AuthUser> => {
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }

  return res.json();
};

export const loginUser = async (
  data: Pick<SignUpFormValues, "username" | "password">
): Promise<AuthUser> => {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }

  return res.json();
};

export const logoutUser = async () => {
  const res = await fetch(`${API_URL}/users/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  return res.json();
};

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  const res = await fetch(`${API_URL}/users/me`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
};
