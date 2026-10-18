import type { AdminInquiryView } from "@/lib/inquiry-store";
import type { OrderView } from "@/lib/order-store";
import type {
  LapEntryView,
  TestDriveRequestView,
  VehicleReviewView,
  VehicleWaitlistEntryView,
  WorkshopTicketView,
} from "@/lib/side-feature-store";

export type AdminDailyTask = {
  id: string;
  label: string;
  count: number;
  href: string;
};

export function buildAdminDailyTasks(input: {
  orders: Array<Pick<OrderView, "status" | "paymentStatus">>;
  testDriveRequests: Array<Pick<TestDriveRequestView, "status">>;
  lapEntries: Array<Pick<LapEntryView, "status">>;
  reviews: Array<Pick<VehicleReviewView, "status">>;
  waitlist: Array<Pick<VehicleWaitlistEntryView, "status">>;
  workshopTickets: Array<Pick<WorkshopTicketView, "status">>;
  inquiries: Array<Pick<AdminInquiryView, "status">>;
}) {
  const tasks: AdminDailyTask[] = [];
  const openOrders = input.orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  ).length;
  const unpaidOrders = input.orders.filter(
    (order) => order.status !== "cancelled" && order.paymentStatus !== "paid",
  ).length;
  const pendingDrives = input.testDriveRequests.filter(
    (request) => request.status === "pending",
  ).length;
  const pendingWorkshop = input.workshopTickets.filter(
    (ticket) => !["completed", "declined"].includes(ticket.status),
  ).length;
  const pendingLaps = input.lapEntries.filter(
    (entry) => entry.status === "pending",
  ).length;
  const pendingReviews = input.reviews.filter(
    (review) => review.status === "pending",
  ).length;
  const waitingCustomers = input.waitlist.filter(
    (entry) => entry.status === "waiting",
  ).length;
  const openInquiries = input.inquiries.filter(
    (inquiry) => inquiry.status === "open" || inquiry.status === "in_progress",
  ).length;

  addTask(
    tasks,
    "open-orders",
    "Offene Bestellungen bearbeiten",
    openOrders,
    "#orders",
  );
  addTask(
    tasks,
    "unpaid-orders",
    "Zahlungen manuell prüfen",
    unpaidOrders,
    "#orders",
  );
  addTask(
    tasks,
    "test-drives",
    "Testfahrt-Anfragen beantworten",
    pendingDrives,
    "#test-drives",
  );
  addTask(
    tasks,
    "workshop",
    "Werkstatt-Tickets prüfen",
    pendingWorkshop,
    "#workshop",
  );
  addTask(tasks, "laps", "Rundenzeiten moderieren", pendingLaps, "#races");
  addTask(
    tasks,
    "reviews",
    "Bewertungen moderieren",
    pendingReviews,
    "#reviews",
  );
  addTask(
    tasks,
    "waitlist",
    "Wartelisten-Kunden kontaktieren",
    waitingCustomers,
    "#waitlist",
  );
  addTask(
    tasks,
    "inquiries",
    "Kundenanfragen bearbeiten",
    openInquiries,
    "#inquiries",
  );
  return tasks;
}

function addTask(
  tasks: AdminDailyTask[],
  id: string,
  label: string,
  count: number,
  href: string,
) {
  if (count > 0) tasks.push({ id, label, count, href });
}
