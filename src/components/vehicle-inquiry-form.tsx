"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function VehicleInquiryForm({
  vehicleId,
  vehicleName,
  signedIn,
}: {
  vehicleId: string;
  vehicleName: string;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  if (!signedIn)
    return (
      <Link
        className="button-secondary"
        href={`/kundenbereich?next=${encodeURIComponent(`/fahrzeuge/${vehicleId}`)}`}
      >
        Anmelden, um Fahrzeug anzufragen
      </Link>
    );
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          subject: `Fahrzeuganfrage: ${vehicleName}`,
          message:
            message.trim() ||
            `Bitte erstellt mir ein individuelles Angebot für den ${vehicleName}.`,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          result?.message ?? "Anfrage konnte nicht gesendet werden.",
        );
      setMessage("");
      setFeedback(
        "Anfrage gesendet. Du findest die Antwort in deinem Kundenbereich.",
      );
      router.refresh();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Anfrage konnte nicht gesendet werden.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form-stack vehicle-inquiry-form" onSubmit={submit}>
      <label className="form-field">
        <span>Deine Nachricht (optional)</span>
        <textarea
          rows={3}
          maxLength={1000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={`Frage zu ${vehicleName} …`}
        />
      </label>
      {feedback && (
        <p className="form-message form-message-status" role="status">
          {feedback}
        </p>
      )}
      <button className="button-secondary" type="submit" disabled={busy}>
        {busy ? "Wird gesendet …" : "Fahrzeug anfragen"}
      </button>
    </form>
  );
}
