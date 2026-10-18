import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AccountPanel } from "@/components/account-panel";
import { getCurrentAccount } from "@/lib/account";
import { vehicles } from "@/lib/catalog";
import { getFirebaseServices, isFirebaseReady } from "@/lib/firebase-admin";
import { type InquiryView, listCustomerInquiries } from "@/lib/inquiry-store";
import { listOrdersForCustomer, type OrderView } from "@/lib/order-store";
import {
  type CustomerNotificationView,
  listCustomerNotifications,
  listCustomerTestDriveRequests,
  listCustomerVehicleWaitlist,
  listCustomerWorkshopTickets,
  listWishlist,
  type TestDriveRequestView,
  type VehicleWaitlistEntryView,
  type WorkshopTicketView,
} from "@/lib/side-feature-store";
import { safeAccountReturnPath } from "@/lib/validation";

export const metadata: Metadata = { title: "Kundenbereich" };

type CustomerAreaPageProps = PageProps<"/kundenbereich">;

export default function CustomerAreaPage(props: CustomerAreaPageProps) {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-container page-heading">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Kundenbereich
          </span>
          <h1>Deine Garage, deine Aufträge.</h1>
          <p>
            Verwalte dein Konto und behalte den Status deiner
            Fahrzeugbestellungen im Blick.
          </p>
        </div>
      </section>
      <div className="page-container page-content">
        <Suspense
          fallback={
            <section className="account-card">
              <p>Kontostatus wird geladen …</p>
            </section>
          }
        >
          <CustomerAreaContent searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function CustomerAreaContent({
  searchParams,
}: Pick<CustomerAreaPageProps, "searchParams">) {
  await connection();
  const params = await searchParams;
  const returnTo = safeAccountReturnPath(params.next);
  const account = await getCurrentAccount();
  const services = getFirebaseServices();
  let orders: OrderView[] = [];
  let ordersError: string | undefined;
  let wishlistVehicles: Array<{
    vehicleId: string;
    vehicleName: string;
    packName: string;
  }> = [];
  let testDriveRequests: TestDriveRequestView[] = [];
  let waitlistEntries: VehicleWaitlistEntryView[] = [];
  let workshopTickets: WorkshopTicketView[] = [];
  let notifications: CustomerNotificationView[] = [];
  let inquiries: InquiryView[] = [];
  let inquiriesError: string | undefined;

  if (account && services) {
    try {
      const [
        customerOrders,
        wishlistIds,
        customerTestDriveRequests,
        customerWaitlistEntries,
        customerWorkshopTickets,
        customerNotifications,
        customerInquiries,
      ] = await Promise.all([
        listOrdersForCustomer(services.db, account.id),
        listWishlist(services.db, account.id),
        listCustomerTestDriveRequests(services.db, account.id),
        listCustomerVehicleWaitlist(services.db, account.id),
        listCustomerWorkshopTickets(services.db, account.id),
        listCustomerNotifications(services.db, account.id),
        listCustomerInquiries(services.db, account.id).catch(() => null),
      ]);
      orders = customerOrders;
      wishlistVehicles = wishlistIds.flatMap((vehicleId) => {
        const vehicle = vehicles.find((entry) => entry.id === vehicleId);
        return vehicle
          ? [
              {
                vehicleId,
                vehicleName: vehicle.name,
                packName: vehicle.packName,
              },
            ]
          : [];
      });
      testDriveRequests = customerTestDriveRequests;
      waitlistEntries = customerWaitlistEntries;
      workshopTickets = customerWorkshopTickets;
      notifications = customerNotifications;
      if (customerInquiries) {
        inquiries = customerInquiries;
      } else {
        inquiriesError =
          "Deine Anfragen konnten gerade nicht geladen werden. Bitte lade die Seite erneut.";
      }
    } catch {
      ordersError =
        "Bestellungen konnten gerade nicht geladen werden. Bitte lade die Seite erneut.";
    }
  }

  return (
    <AccountPanel
      firebaseReady={isFirebaseReady()}
      account={account}
      orders={orders}
      wishlistVehicles={wishlistVehicles}
      testDriveRequests={testDriveRequests}
      waitlistEntries={waitlistEntries}
      workshopTickets={workshopTickets}
      notifications={notifications}
      inquiries={inquiries}
      inquiriesError={inquiriesError}
      ordersError={ordersError}
      returnTo={returnTo}
    />
  );
}
