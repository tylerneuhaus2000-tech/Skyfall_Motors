import Link from "next/link";
import { ArrowIcon } from "@/components/vehicle-card";

export function SectionPlaceholder({
  eyebrow = "In Vorbereitung",
  title,
  description,
  nextStep = "Zum Fahrzeugkatalog",
}: {
  eyebrow?: string;
  title: string;
  description: string;
  nextStep?: string;
}) {
  return (
    <div className="page-container page-content">
      <section className="not-found-card">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> {eyebrow}
        </span>
        <h2 className="placeholder-heading">{title}</h2>
        <p className="placeholder-copy">{description}</p>
        <Link className="text-link" href="/fahrzeuge">
          {nextStep} <ArrowIcon />
        </Link>
      </section>
    </div>
  );
}
