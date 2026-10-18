import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getCurrentAccount, isStaff } from "@/lib/account";
import {
  type AdminPermission,
  permissionsForAccount,
} from "@/lib/admin-permissions";
import { listAdminAnnouncements } from "@/lib/announcement-store";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";
import { listAdminInquiries } from "@/lib/inquiry-store";
import {
  getHomepageHighlightVehicleId,
  getShopSettings,
  listAdminAuditActivities,
  listAdminCustomers,
  listAdminInventory,
  listAdminOrders,
} from "@/lib/order-store";
import { defaultShopSettings } from "@/lib/shop-settings-domain";
import {
  listAdminLapEntries,
  listAdminTestDriveRequests,
  listAdminVehicleReviews,
  listAdminVehicleWaitlist,
  listAdminWorkshopTickets,
} from "@/lib/side-feature-store";

export const metadata: Metadata = { title: "Command Center" };

export default function AdminPage() {
  return (
    <main id="main-content">
      <div className="admin-page-wrap">
        <Suspense
          fallback={
            <section className="account-card">
              <p>Geschützter Bereich wird geprüft …</p>
            </section>
          }
        >
          <AdminContent />
        </Suspense>
      </div>
    </main>
  );
}

async function AdminContent() {
  await connection();
  const account = await getCurrentAccount();
  if (!isFirebaseReady()) {
    return (
      <section className="account-card setup-card" role="status">
        <h2>Adminbereich bleibt geschlossen.</h2>
        <p>
          Firebase ist nicht vollständig eingerichtet. Es wurden keine
          Admin-Zugangsdaten oder Standardkonten angelegt.
        </p>
      </section>
    );
  }

  if (!account) {
    return (
      <section className="account-card setup-card">
        <h2>Bitte anmelden.</h2>
        <p>
          Nur freigegebene Inhaber und Mitarbeiter sehen Bestellungen und
          Kundendaten.
        </p>
        <Link className="button-primary" href="/kundenbereich?next=/admin">
          Zum Kundenkonto
        </Link>
      </section>
    );
  }
  if (!isStaff(account)) {
    return (
      <section className="account-card setup-card" role="alert">
        <h2>Kein Zugriff.</h2>
        <p>Dein Konto hat keine Mitarbeiterfreigabe.</p>
      </section>
    );
  }
  if (account.role === "staff" && !account.staffRole) {
    return (
      <section className="account-card setup-card" role="alert">
        <h2>Mitarbeiterrolle fehlt.</h2>
        <p>
          Dieses Konto hat keine gültige Mitarbeiterrolle. Bitte den Inhaber
          bitten, die Rolle im Command Center neu zuzuweisen.
        </p>
      </section>
    );
  }

  const permissions = permissionsForAccount(account.role, account.staffRole);
  const can = (permission: AdminPermission) => permissions.includes(permission);
  const todayKey = new Date().toISOString().slice(0, 10);

  const services = getFirebaseServices();
  if (!services) {
    return (
      <section className="account-card" role="alert">
        <p>Firebase ist nicht erreichbar.</p>
      </section>
    );
  }

  try {
    const [
      orders,
      customers,
      inventory,
      testDriveRequests,
      lapEntries,
      reviews,
      waitlist,
      workshopTickets,
      auditActivities,
      homepageHighlightVehicleId,
      shopSettings,
      inquiries,
      announcements,
    ] = await Promise.all([
      can("orders") ? listAdminOrders(services.db) : Promise.resolve([]),
      can("customers") ? listAdminCustomers(services.db) : Promise.resolve([]),
      can("inventory") ? listAdminInventory(services.db) : Promise.resolve([]),
      can("test_drives")
        ? listAdminTestDriveRequests(services.db)
        : Promise.resolve([]),
      can("races") ? listAdminLapEntries(services.db) : Promise.resolve([]),
      can("reviews")
        ? listAdminVehicleReviews(services.db)
        : Promise.resolve([]),
      can("waitlist")
        ? listAdminVehicleWaitlist(services.db)
        : Promise.resolve([]),
      can("workshop")
        ? listAdminWorkshopTickets(services.db)
        : Promise.resolve([]),
      can("audit")
        ? listAdminAuditActivities(services.db)
        : Promise.resolve([]),
      can("marketing")
        ? getHomepageHighlightVehicleId(services.db, todayKey)
        : Promise.resolve(null),
      can("settings") ? getShopSettings(services.db) : Promise.resolve(null),
      can("inquiries") ? listAdminInquiries(services.db) : Promise.resolve([]),
      can("marketing")
        ? listAdminAnnouncements(services.db)
        : Promise.resolve([]),
    ]);
    return (
      <AdminDashboard
        accountId={account.id}
        accountName={account.minecraftUsername}
        todayKey={todayKey}
        homepageHighlightVehicleId={homepageHighlightVehicleId}
        shopSettings={shopSettings ?? defaultShopSettings}
        inquiries={inquiries}
        announcements={announcements}
        staffRole={account.staffRole}
        permissions={permissions}
        orders={orders}
        customers={customers}
        inventory={inventory}
        testDriveRequests={testDriveRequests}
        lapEntries={lapEntries}
        reviews={reviews}
        waitlist={waitlist}
        workshopTickets={workshopTickets}
        auditActivities={auditActivities}
      />
    );
  } catch {
    return (
      <section className="account-card" role="alert">
        <h2>Verwaltungsdaten konnten nicht geladen werden.</h2>
        <p>
          Es wurden keine Änderungen ausgeführt. Prüfe die
          Firebase-Berechtigungen und lade erneut.
        </p>
      </section>
    );
  }
}
