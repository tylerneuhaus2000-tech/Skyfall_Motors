import { z } from "zod";
import { staffRoles } from "./admin-permissions";
import { shopModes } from "./shop-settings-domain";

export const minecraftUsernameSchema = z
  .string()
  .trim()
  .min(3, "Der Minecraft-Name muss mindestens 3 Zeichen enthalten.")
  .max(16, "Der Minecraft-Name darf höchstens 16 Zeichen enthalten.")
  .regex(/^[A-Za-z0-9_]+$/, "Nutze nur Buchstaben, Zahlen und Unterstriche.");

export const passwordSchema = z
  .string()
  .min(12, "Das Passwort muss mindestens 12 Zeichen enthalten.")
  .max(128, "Das Passwort darf höchstens 128 Zeichen enthalten.");

export const registerSchema = z.object({
  minecraftUsername: minecraftUsernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  minecraftUsername: minecraftUsernameSchema,
  password: z.string().min(1).max(128),
});

export const sessionSchema = z.object({ idToken: z.string().min(1).max(8192) });
const vehicleIdSchema = z.string().regex(/^[a-z0-9-]{3,80}$/);

export const createOrderSchema = z.object({
  vehicleId: z.string().regex(/^[a-z0-9-]{3,80}$/),
  idempotencyKey: z.string().uuid(),
  handover: z.enum(["pickup", "delivery"]),
  express: z.boolean(),
  paymentMethod: z.enum(["terminal", "handover"]),
});

export const inventoryUpdateSchema = z.object({
  vehicleId: z.string().regex(/^[a-z0-9-]{3,80}$/),
  approved: z.boolean(),
  availableUnits: z.number().int().min(0).max(1000),
  priceDiamonds: z.number().int().min(1).max(100_000),
  serverInstallationConfirmed: z.boolean(),
});

export const inventoryBulkActionSchema = z
  .object({
    action: z.literal("pause_sales"),
    vehicleIds: z
      .array(z.string().regex(/^[a-z0-9-]{3,80}$/))
      .min(1)
      .max(50),
  })
  .refine(({ vehicleIds }) => new Set(vehicleIds).size === vehicleIds.length, {
    message: "Fahrzeuge dürfen nur einmal ausgewählt werden.",
  });

const firestoreOrderIdSchema = z.string().regex(/^[A-Za-z0-9]{20}$/);

export const adminOrderActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("confirm_payment"),
    orderId: firestoreOrderIdSchema,
  }),
  z.object({
    action: z.literal("set_status"),
    orderId: firestoreOrderIdSchema,
    status: z.enum([
      "in_production",
      "ready_for_handover",
      "delivered",
      "cancelled",
    ]),
  }),
]);

export const verifyCustomerSchema = z.object({ userId: z.string().uuid() });

export const staffRoleUpdateSchema = z.object({
  userId: z.string().uuid(),
  staffRole: z.enum(staffRoles).nullable(),
});

export const homepageHighlightSchema = z.object({
  vehicleId: z
    .string()
    .regex(/^[a-z0-9-]{3,80}$/)
    .optional(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const shopSettingsUpdateSchema = z.object({
  mode: z.enum(shopModes),
  deliveryFee: z.number().int().min(0).max(100_000),
  expressFee: z.number().int().min(0).max(100_000),
});

export const customerInquirySchema = z.object({
  subject: z.string().trim().min(3).max(100),
  message: z.string().trim().min(10).max(2000),
  vehicleId: vehicleIdSchema.optional(),
});

export const adminInquiryUpdateSchema = z
  .object({
    inquiryId: z.string().regex(/^[A-Za-z0-9]{20}$/),
    status: z.enum(["open", "in_progress", "answered", "closed"]),
    staffReply: z.string().trim().max(2000),
    internalNote: z.string().trim().max(1000),
    offerPriceDiamonds: z
      .number()
      .int()
      .min(1)
      .max(100_000)
      .nullable()
      .optional(),
  })
  .refine(
    ({ status, staffReply }) => status !== "answered" || staffReply.length >= 5,
    { message: "Eine beantwortete Anfrage benötigt eine sichtbare Antwort." },
  );

export const customerOfferResponseSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("decline"),
    inquiryId: z.string().regex(/^[A-Za-z0-9]{20}$/),
  }),
  z.object({
    action: z.literal("accept"),
    inquiryId: z.string().regex(/^[A-Za-z0-9]{20}$/),
    idempotencyKey: z.string().uuid(),
  }),
]);

export const announcementMutationSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    title: z.string().trim().min(3).max(100),
    body: z.string().trim().min(10).max(2000),
    published: z.boolean(),
  }),
  z.object({
    action: z.literal("update"),
    announcementId: z.string().regex(/^[A-Za-z0-9]{20}$/),
    title: z.string().trim().min(3).max(100),
    body: z.string().trim().min(10).max(2000),
    published: z.boolean(),
  }),
]);

export const wishlistActionSchema = z.object({
  action: z.enum(["add", "remove"]),
  vehicleId: vehicleIdSchema,
});

export const testDriveRequestSchema = z.object({
  vehicleId: vehicleIdSchema,
  preferredWindow: z.string().trim().max(120).optional().default(""),
});

export const testDriveAdminActionSchema = z.object({
  requestId: z.string().regex(/^[a-f0-9]{64}$/),
  action: z.enum(["approve", "decline", "complete"]),
});

export const lapEntrySchema = z.object({
  vehicleId: vehicleIdSchema,
  trackName: z.string().trim().min(2).max(80),
  timeMs: z.number().int().min(100).max(3_600_000),
});

export const lapModerationSchema = z.object({
  entryId: firestoreOrderIdSchema,
  action: z.enum(["approve", "reject"]),
});

export const customerReviewSchema = z.object({
  vehicleId: vehicleIdSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(1000),
});

export const reviewModerationSchema = z.object({
  reviewId: z.string().regex(/^[a-f0-9]{64}$/),
  action: z.enum(["approve", "reject"]),
});

export const vehicleWaitlistSchema = z.object({
  action: z.enum(["join", "leave"]),
  vehicleId: vehicleIdSchema,
});

export const waitlistModerationSchema = z.object({
  waitlistId: z.string().regex(/^[a-f0-9]{64}$/),
  action: z.literal("mark_contacted"),
});

export const workshopTicketSchema = z.object({
  vehicleId: vehicleIdSchema,
  requestType: z.enum(["repair", "tuning"]),
  description: z.string().trim().min(8).max(600),
});

export const workshopTicketAdminActionSchema = z.object({
  ticketId: z.string().regex(/^[A-Za-z0-9]{20}$/),
  status: z.enum([
    "in_review",
    "waiting_for_parts",
    "ready",
    "completed",
    "declined",
  ]),
});

export const notificationReadSchema = z.object({
  notificationId: z.string().regex(/^[A-Za-z0-9]{20}$/),
});

export function normalizeMinecraftUsername(value: string) {
  return value.toLowerCase();
}

export function safeAccountReturnPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/kundenbereich";
  }
  try {
    const url = new URL(value, "https://skyfall.invalid");
    return url.origin === "https://skyfall.invalid"
      ? `${url.pathname}${url.search}${url.hash}`
      : "/kundenbereich";
  } catch {
    return "/kundenbereich";
  }
}
