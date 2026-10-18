import "server-only";

import { getCurrentAccount, isStaff } from "@/lib/account";
import {
  type AdminPermission,
  hasAdminPermission,
} from "@/lib/admin-permissions";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";
import { HttpError } from "@/lib/security";

export async function requireApiAccount() {
  if (!isFirebaseReady()) {
    throw new HttpError(
      "Firebase ist noch nicht eingerichtet.",
      503,
      "not_configured",
    );
  }
  const services = getFirebaseServices();
  const account = await getCurrentAccount();
  if (!services || !account)
    throw new HttpError("Bitte melde dich an.", 401, "unauthenticated");
  return { services, account };
}

export async function requireApiStaff() {
  const result = await requireApiAccount();
  if (!isStaff(result.account)) {
    throw new HttpError(
      "Für diese Aktion fehlen die erforderlichen Rechte.",
      403,
      "forbidden",
    );
  }
  return result;
}

export async function requireApiPermission(permission: AdminPermission) {
  const result = await requireApiAccount();
  if (
    !hasAdminPermission(
      result.account.role,
      result.account.staffRole,
      permission,
    )
  ) {
    throw new HttpError(
      "Für diese Aktion fehlen die erforderlichen Rechte.",
      403,
      "forbidden",
    );
  }
  return result;
}

export async function requireApiOwner() {
  const result = await requireApiAccount();
  if (result.account.role !== "owner") {
    throw new HttpError(
      "Diese Aktion ist ausschließlich dem Inhaber vorbehalten.",
      403,
      "owner_required",
    );
  }
  return result;
}
