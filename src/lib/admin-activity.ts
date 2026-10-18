export type AdminActivityView = {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  createdAt: number;
};

const activityLabels: Record<string, string> = {
  "order.created": "Bestellung angelegt",
  "order.payment_confirmed": "Zahlung manuell bestätigt",
  "inventory.updated": "Fahrzeugbestand geändert",
  "inventory.sales_paused": "Bestellfreigabe pausiert",
  "customer.minecraft_identity_verified": "Minecraft-Identität bestätigt",
  "staff.role_assigned": "Mitarbeiterrolle vergeben",
  "staff.role_revoked": "Mitarbeiterrolle entzogen",
  "marketing.homepage_highlight_set": "Tageshighlight festgelegt",
  "marketing.homepage_highlight_cleared": "Tageshighlight zurückgesetzt",
  "shop.settings_updated": "Shop-Einstellungen geändert",
  "customer_inquiry.updated": "Kundenanfrage bearbeitet",
  "customer_inquiry.created": "Kundenanfrage eingegangen",
  "announcement.created": "Ankündigung angelegt",
  "announcement.updated": "Ankündigung geändert",
  "vehicle_waitlist.contacted": "Wartelistenkontakt dokumentiert",
  "vehicle_review.approved": "Kundenbewertung freigegeben",
  "vehicle_review.rejected": "Kundenbewertung abgelehnt",
};

export function adminActivityLabel(action: string) {
  if (activityLabels[action]) return activityLabels[action];
  if (action.startsWith("order.status.")) return "Bestellstatus geändert";
  if (action.startsWith("test_drive.")) return "Testfahrtstatus geändert";
  if (action.startsWith("workshop_ticket.")) return "Werkstattstatus geändert";
  if (action.startsWith("lap_time.")) return "Rundenzeit moderiert";
  return "Aktion protokolliert";
}
