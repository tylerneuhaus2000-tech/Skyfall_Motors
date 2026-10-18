import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SKYFALL MOTORS — Fahrzeuge für dein Survival",
    template: "%s — SKYFALL MOTORS",
  },
  description:
    "Der Fahrzeugkatalog von SKYFALL MOTORS. Minecraft-Mod-Fahrzeuge werden für Version, NeoForge und Survival einzeln geprüft.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de">
      <body>
        <a className="skip-link" href="#main-content">
          Zum Inhalt springen
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
