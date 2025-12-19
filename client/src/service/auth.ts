import type { SignUpFormValues } from "../components/auth/SignUpForm";
import type { AuthUser } from "../store/authStore";

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
