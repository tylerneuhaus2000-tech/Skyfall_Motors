"use client";

import { useEffect, useState } from "react";
import {
  type AdminActivityView,
  adminActivityLabel,
} from "@/lib/admin-activity";

type ActivityActor = { id: string; name: string };

export function AdminActivityFeed({
  initialActivities,
  staffActors,
}: {
  initialActivities: AdminActivityView[];
  staffActors: ActivityActor[];
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [connection, setConnection] = useState<
    "connecting" | "live" | "reconnecting" | "unavailable"
  >("connecting");
  const staffActorIds = staffActors.map((actor) => actor.id).join("\n");

  useEffect(() => {
    const source = new EventSource("/api/admin/activity");
    const staffIds = new Set(staffActorIds.split("\n").filter(Boolean));
    source.onopen = () => setConnection("live");
    source.onerror = () => setConnection("reconnecting");
    source.onmessage = (event) => {
      try {
        const value: unknown = JSON.parse(event.data);
        if (!Array.isArray(value)) return;
        const next = value.filter(
          (entry): entry is AdminActivityView =>
            entry !== null &&
            typeof entry === "object" &&
            typeof entry.id === "string" &&
            typeof entry.actorId === "string" &&
            typeof entry.action === "string" &&
            typeof entry.targetId === "string" &&
            typeof entry.createdAt === "number" &&
            staffIds.has(entry.actorId),
        );
        setActivities(next);
        setConnection("live");
      } catch {
        setConnection("reconnecting");
      }
    };
    source.addEventListener("stream-error", () => {
      setConnection("unavailable");
      source.close();
    });
    return () => source.close();
  }, [staffActorIds]);

  const staffNames = new Map(
    staffActors.map((actor) => [actor.id, actor.name]),
  );
  const statusText = {
    connecting: "Verbindung wird aufgebaut …",
    live: "Live · neue Audit-Ereignisse erscheinen automatisch",
    reconnecting: "Verbindung wird wiederhergestellt …",
    unavailable:
      "Live-Feed nicht verfügbar; letzte geladene Ereignisse bleiben sichtbar.",
  }[connection];

  return (
    <section className="command-panel command-activity-panel">
      <div className="command-panel-heading">
        <div>
          <span className="eyebrow">Audit-Log</span>
          <h3>Letzte Aktivitäten</h3>
        </div>
        <span className={`activity-connection activity-${connection}`}>
          {statusText}
        </span>
      </div>
      {activities.length ? (
        <ol className="command-activity-list">
          {activities.slice(0, 12).map((activity) => (
            <li key={activity.id}>
              <span>
                <strong>{adminActivityLabel(activity.action)}</strong>
                <small>{staffNames.get(activity.actorId) ?? "Konto"}</small>
              </span>
              <time
                dateTime={new Date(activity.createdAt).toISOString()}
                title={new Date(activity.createdAt).toLocaleString("de-DE")}
              >
                {activity.createdAt
                  ? new Date(activity.createdAt).toLocaleString("de-DE")
                  : "Zeit unbekannt"}
              </time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-state">Noch keine Aktivitäten protokolliert.</p>
      )}
    </section>
  );
}
