"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminInquiryView, InquiryStatus } from "@/lib/inquiry-store";

type Draft = {
  status: InquiryStatus;
  staffReply: string;
  internalNote: string;
  offerPriceDiamonds: string;
};

const labels: Record<InquiryStatus, string> = {
  open: "Eingegangen",
  in_progress: "Wird bearbeitet",
  answered: "Beantwortet",
  closed: "Abgeschlossen",
};

export function AdminInquiryPanel({
  inquiries,
}: {
  inquiries: AdminInquiryView[];
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  function draftFor(inquiry: AdminInquiryView): Draft {
    return (
      drafts[inquiry.id] ?? {
        status: inquiry.status,
        staffReply: inquiry.staffReply,
        internalNote: inquiry.internalNote,
        offerPriceDiamonds:
          inquiry.offerPriceDiamonds == null
            ? ""
            : String(inquiry.offerPriceDiamonds),
      }
    );
  }

  function update(inquiry: AdminInquiryView, values: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [inquiry.id]: { ...draftFor(inquiry), ...values },
    }));
  }

  async function save(inquiry: AdminInquiryView) {
    const draft = draftFor(inquiry);
    setBusy(inquiry.id);
    setFeedback((current) => ({ ...current, [inquiry.id]: "" }));
    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: inquiry.id,
          ...draft,
          offerPriceDiamonds: draft.offerPriceDiamonds
            ? Number(draft.offerPriceDiamonds)
            : null,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok)
        throw new Error(result?.message ?? "Änderung fehlgeschlagen.");
      setFeedback((current) => ({
        ...current,
        [inquiry.id]: "Anfrage gespeichert.",
      }));
      router.refresh();
    } catch (error) {
      setFeedback((current) => ({
        ...current,
        [inquiry.id]:
          error instanceof Error ? error.message : "Änderung fehlgeschlagen.",
      }));
    } finally {
      setBusy("");
    }
  }

  return (
    <section id="inquiries" className="account-card admin-section">
      <div className="account-card-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Kundenservice · Owner/Sales
          </span>
          <h2>Kundenanfragen</h2>
        </div>
        <span className="admin-count">
          {
            inquiries.filter(
              (entry) =>
                entry.status === "open" || entry.status === "in_progress",
            ).length
          }{" "}
          offen
        </span>
      </div>
      {inquiries.length ? (
        <div className="inquiry-list admin-inquiry-list">
          {inquiries.map((inquiry) => {
            const draft = draftFor(inquiry);
            return (
              <article className="inquiry-card" key={inquiry.id}>
                <div className="inquiry-heading">
                  <div>
                    <strong>{inquiry.subject}</strong>
                    <small>
                      {inquiry.minecraftUsername} ·{" "}
                      {new Date(inquiry.createdAt).toLocaleString("de-DE")}
                    </small>
                  </div>
                  <span className="status-pill">{labels[inquiry.status]}</span>
                </div>
                <p>{inquiry.message}</p>
                {inquiry.vehicleName && (
                  <p>
                    <strong>Fahrzeug:</strong> {inquiry.vehicleName}
                  </p>
                )}
                <div className="inquiry-admin-form">
                  <label>
                    <span>Status</span>
                    <select
                      value={draft.status}
                      disabled={busy === inquiry.id}
                      onChange={(event) =>
                        update(inquiry, {
                          status: event.target.value as InquiryStatus,
                        })
                      }
                    >
                      {Object.entries(labels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {inquiry.vehicleId && (
                    <label>
                      <span>
                        Individuelles Angebot in Diamanten · nur
                        Anfragefahrzeuge
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        step="1"
                        inputMode="numeric"
                        value={draft.offerPriceDiamonds}
                        disabled={
                          busy === inquiry.id ||
                          inquiry.offerStatus === "accepted"
                        }
                        onChange={(event) =>
                          update(inquiry, {
                            offerPriceDiamonds: event.target.value,
                          })
                        }
                      />
                      {inquiry.offerStatus === "offered" && (
                        <small>
                          Offen beim Kunden · {inquiry.offerPriceDiamonds} 💎
                        </small>
                      )}
                    </label>
                  )}
                  <label>
                    <span>Antwort für den Kunden</span>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={draft.staffReply}
                      disabled={busy === inquiry.id}
                      onChange={(event) =>
                        update(inquiry, { staffReply: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    <span>Interne Notiz · nur Mitarbeiter</span>
                    <textarea
                      rows={2}
                      maxLength={1000}
                      value={draft.internalNote}
                      disabled={busy === inquiry.id}
                      onChange={(event) =>
                        update(inquiry, { internalNote: event.target.value })
                      }
                    />
                  </label>
                </div>
                {feedback[inquiry.id] && (
                  <p className="form-message form-message-status" role="status">
                    {feedback[inquiry.id]}
                  </p>
                )}
                <button
                  className="button-primary"
                  type="button"
                  disabled={busy === inquiry.id}
                  onClick={() => void save(inquiry)}
                >
                  {busy === inquiry.id
                    ? "Speichert …"
                    : "Bearbeitung speichern"}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">Es liegen keine Kundenanfragen vor.</p>
      )}
    </section>
  );
}
