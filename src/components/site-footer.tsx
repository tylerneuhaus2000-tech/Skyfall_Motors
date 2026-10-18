import Link from "next/link";

const footerLinks = [
  ["/fahrzeuge", "Fahrzeuge"],
  ["/gebrauchtwagen", "Gebrauchtwagen"],
  ["/werkstatt", "Werkstatt"],
  ["/rennstrecke", "Rennstrecke"],
  ["/race-center", "Race Center"],
  ["/ueber-uns", "Über uns"],
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <Link
            href="/"
            className="brand"
            aria-label="SKYFALL MOTORS Startseite"
          >
            <span className="brand-name">SKYFALL</span>
            <span className="brand-subtitle">MOTORS</span>
          </Link>
          <p className="footer-brand-copy">
            Fahrzeuge und Motorsport für dein Minecraft-Survival. Jede
            Pack-Angabe wird geprüft, bevor sie Teil des Angebots wird.
          </p>
        </div>
        <div>
          <div className="footer-heading">Entdecken</div>
          <nav className="footer-links" aria-label="Footer">
            {footerLinks.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <div className="footer-heading">Aktueller Stand</div>
          <p className="footer-note">
            Bestellungen sind nur für geprüfte Modelle mit freigegebenem
            Serverbestand möglich. Nicht freigegebene Fahrzeuge bleiben klar
            gekennzeichnet.
          </p>
        </div>
      </div>
      <div className="footer-inner footer-bottom">
        <span>© SKYFALL MOTORS</span>
        <span>Minecraft Java Edition · 1.21.1 · NeoForge</span>
      </div>
    </footer>
  );
}
