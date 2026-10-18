import type { OrderStatus, PaymentStatus } from "@/lib/order-domain";

export type AdminAnalyticsOrder = {
  vehicleId: string;
  vehicleName: string;
  totalPrice: number;
  handover: "pickup" | "delivery";
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  handedOverAt: number | null;
};

export function summarizeAdminOrders(orders: AdminAnalyticsOrder[]) {
  const activeOrders = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled",
  );
  const activePaymentOrders = orders.filter(
    (order) => order.status !== "cancelled",
  );
  const completedSales = orders.filter(
    (order) =>
      order.status === "delivered" &&
      order.paymentStatus === "paid" &&
      typeof order.handedOverAt === "number" &&
      order.handedOverAt > 0,
  );

  const bestsellers = new Map<string, { name: string; count: number }>();
  for (const order of completedSales) {
    const current = bestsellers.get(order.vehicleId);
    bestsellers.set(order.vehicleId, {
      name: order.vehicleName,
      count: (current?.count ?? 0) + 1,
    });
  }

  return {
    openOrders: activeOrders.length,
    unpaidOrders: activePaymentOrders.filter(
      (order) => order.paymentStatus !== "paid",
    ).length,
    openDeliveryOrders: activeOrders.filter(
      (order) => order.handover === "delivery",
    ).length,
    confirmedDiamonds: activePaymentOrders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((total, order) => total + order.totalPrice, 0),
    completedSales: completedSales.length,
    bestsellers: Array.from(bestsellers, ([vehicleId, item]) => ({
      vehicleId,
      ...item,
    }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 5),
  };
}

export function buildAdminSalesSeries(
  orders: AdminAnalyticsOrder[],
  days: 7 | 30 | 90,
  now: Date,
) {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const rows = Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - index - 1) * 86_400_000);
    return {
      dateKey: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: days === 7 ? "short" : undefined,
        timeZone: "UTC",
      }).format(date),
      orders: 0,
      diamonds: 0,
    };
  });
  const byDate = new Map(rows.map((row) => [row.dateKey, row]));

  for (const order of orders) {
    if (
      order.status !== "delivered" ||
      order.paymentStatus !== "paid" ||
      typeof order.handedOverAt !== "number" ||
      order.handedOverAt <= 0
    ) {
      continue;
    }
    const dateKey = new Date(order.handedOverAt).toISOString().slice(0, 10);
    const row = byDate.get(dateKey);
    if (row) {
      row.orders += 1;
      row.diamonds += order.totalPrice;
    }
  }
  return rows;
}
