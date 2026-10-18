"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AnnouncementView } from "@/lib/announcement-store";

type AnnouncementDraft = { title: string; body: string; published: boolean };
const emptyDraft: AnnouncementDraft = { title: "", body: "", published: false };

export function AdminAnnouncements({
  initialAnnouncements,
}: {
  initialAnnouncements: AnnouncementView[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(emptyDraft);
  const [edits, setEdits] = useState<Record<string, AnnouncementDraft>>({});
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState("");

  function editFor(item: AnnouncementView) {
    return (
      edits[item.id] ?? {
        title: item.title,
        body: item.body,
        published: item.published,
      }
    );
  }

  async function save(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          result?.message ?? "Ankündigung konnte nicht gespeichert werden.",
        );
      setFeedback("Ankündigung gespeichert.");
      if (key === "new") setDraft(emptyDraft);
      router.refresh();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Ankündigung konnte nicht gespeichert werden.",
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="account-card admin-section announcement-admin-section">
      <div className="account-card-heading">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" /> Öffentlich · Owner
          </span>
          <h2>Ankündigungen</h2>
        </div>
        <span className="admin-count">
          {initialAnnouncements.filter((item) => item.published).length}{" "}
          veröffentlicht
        </span>
      </div>
      <p className="admin-help">
        Veröffentlichte Einträge erscheinen auf der Startseite. Entwürfe bleiben
        intern.
      </p>
      <form
        className="announcement-editor"
        onSubmit={(event) => {
          event.preventDefault();
          void save({ action: "create", ...draft }, "new");
        }}
      >
        <label>
          <span>Neue Ankündigung</span>
          <input
            required
            minLength={3}
            maxLength={100}
            placeholder="Titel"
            value={draft.title}
            disabled={busy === "new"}
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
          />
        </label>
        <label>
          <span>Text</span>
          <textarea
            required
            minLength={10}
            maxLength={2000}
            rows={3}
            value={draft.body}
            disabled={busy === "new"}
            onChange={(event) =>
              setDraft((current) => ({ ...current, body: event.target.value }))
            }
          />
        </label>
        <label className="announcement-publish-toggle">
          <input
            type="checkbox"
            checked={draft.published}
            disabled={busy === "new"}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                published: event.target.checked,
              }))
            }
          />
          <span>Sofort veröffentlichen</span>
        </label>
        <button
          className="button-primary"
          type="submit"
          disabled={busy === "new"}
        >
          {busy === "new" ? "Speichert …" : "Ankündigung anlegen"}
        </button>
      </form>
      {feedback && (
        <p className="form-message form-message-status" role="status">
          {feedback}
        </p>
      )}
      {initialAnnouncements.length ? (
        <div className="announcement-admin-list">
          {initialAnnouncements.map((item) => {
            const values = editFor(item);
            return (
              <article className="announcement-admin-item" key={item.id}>
                <div className="inquiry-heading">
                  <strong>{item.title}</strong>
                  <span className="status-pill">
                    {item.published ? "Veröffentlicht" : "Entwurf"}
                  </span>
                </div>
                <label>
                  <span>Titel</span>
                  <input
                    maxLength={100}
                    value={values.title}
                    disabled={busy === item.id}
                    onChange={(event) =>
                      setEdits((current) => ({
                        ...current,
                        [item.id]: {
                          ...editFor(item),
                          title: event.target.value,
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Text</span>
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={values.body}
                    disabled={busy === item.id}
                    onChange={(event) =>
                      setEdits((current) => ({
                        ...current,
                        [item.id]: {
                          ...editFor(item),
                          body: event.target.value,
                        },
                      }))
                    }
                  />
                </label>
                <label className="announcement-publish-toggle">
                  <input
                    type="checkbox"
                    checked={values.published}
                    disabled={busy === item.id}
                    onChange={(event) =>
                      setEdits((current) => ({
                        ...current,
                        [item.id]: {
                          ...editFor(item),
                          published: event.target.checked,
                        },
                      }))
                    }
                  />
                  <span>Öffentlich anzeigen</span>
                </label>
                <button
                  className="button-secondary"
                  type="button"
                  disabled={busy === item.id}
                  onClick={() =>
                    void save(
                      { action: "update", announcementId: item.id, ...values },
                      item.id,
                    )
                  }
                >
                  {busy === item.id ? "Speichert …" : "Änderungen speichern"}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">Noch keine Ankündigungen erstellt.</p>
      )}
    </section>
  );
}
