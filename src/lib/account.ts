import "server-only";

import { cookies } from "next/headers";
import { isStaffRole, type StaffRole } from "@/lib/admin-permissions";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";

export const SESSION_COOKIE = "skyfall_session";
export const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000;

export type PublicAccount = {
  id: string;
  minecraftUsername: string;
  role: "customer" | "owner" | "staff";
  staffRole: StaffRole | null;
  minecraftVerified: boolean;
  createdAt: number;
};

export async function getCurrentAccount(): Promise<PublicAccount | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;
  if (!isFirebaseReady()) return null;

  const services = getFirebaseServices();
  if (!services) return null;

  try {
    const decoded = await services.auth.verifySessionCookie(
      sessionCookie,
      true,
    );
    const account = await services.db
      .collection("users")
      .doc(decoded.uid)
      .get();
    if (!account.exists || account.get("accountStatus") !== "active")
      return null;
    return publicAccount(
      decoded.uid,
      (account.data() ?? {}) as Record<string, unknown>,
    );
  } catch {
    return null;
  }
}

export function publicAccount(
  id: string,
  data: Record<string, unknown>,
): PublicAccount | null {
  const minecraftUsername = data.minecraftUsername;
  const role = data.role;
  if (
    typeof minecraftUsername !== "string" ||
    (role !== "customer" && role !== "owner" && role !== "staff")
  )
    return null;

  const createdAt = data.createdAt;
  return {
    id,
    minecraftUsername,
    role,
    staffRole:
      role === "staff"
        ? isStaffRole(data.staffRole)
          ? data.staffRole
          : null
        : null,
    minecraftVerified: data.minecraftVerified === true,
    createdAt:
      createdAt &&
      typeof createdAt === "object" &&
      "toMillis" in createdAt &&
      typeof createdAt.toMillis === "function"
        ? createdAt.toMillis()
        : typeof createdAt === "number"
          ? createdAt
          : 0,
  };
}

export function isStaff(account: PublicAccount) {
  return account.role === "owner" || account.role === "staff";
}
