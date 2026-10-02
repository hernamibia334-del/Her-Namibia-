import { useState } from "react";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

const LOGO_URL = "/her-namibia-logo.png";

const DEV_EMAIL = "mubianasaya@gmail.com";
const DEV_WEBSITE = "https://sayamubianaa.netlify.app/";

export function Footer() {
  const [devMenuOpen, setDevMenuOpen] = useState(false);

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <a href="/" className="inline-block rounded-md bg-background p-3">
            <img
              src={LOGO_URL}
              alt="Her Namibia logo"
              className="h-11 w-auto object-contain"
            />
          </a>
          <p className="mt-4 max-w-xs text-sm text-sidebar-foreground/80">
            Celebrating women's voices and experiences across Namibia through meaningful 
            conversations and inspiring stories.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold tracking-wide text-sidebar-foreground">Explore</h4>
          <ul className="mt-4 space-y-2.5">
            {[
              { label: "Home", href: "/" },
              { label: "About Her Namibia", href: "/#about" },
              { label: "Our Stories", href: "/#stories" },
              { label: "Woman of the Month", href: "/#woman-of-month" },
            ].map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-sidebar-foreground/80 transition-colors hover:text-sidebar-foreground">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="mailto:priscillamukokobi@gmail.com"
                className="text-sm font-semibold text-sidebar-primary transition-colors hover:text-sidebar-foreground"
              >
                Share Your Story
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold tracking-wide text-sidebar-foreground">Featured</h4>
          <ul className="mt-4 space-y-2.5">
            {[
              { label: "News", href: "/news" },
              { label: "Articles", href: "/projects" },
              { label: "Resources", href: "/resources" },
              { label: "Podcast", href: "/podcast" },
            ].map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-sidebar-foreground/80 transition-colors hover:text-sidebar-foreground">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold tracking-wide text-sidebar-foreground">Contact</h4>
          <p className="mt-4 flex items-start gap-3 text-sm text-sidebar-foreground/80">
            <MapPin className="mt-0.5 size-4 shrink-0 text-sidebar-primary" />
            Windhoek, Namibia
          </p>
          <a href="tel:+264813618370" className="mt-3 flex items-center gap-3 text-sm text-sidebar-foreground/80 transition-colors hover:text-sidebar-foreground">
            <Phone className="size-4 shrink-0 text-sidebar-primary" />
            +264 81 361 8370
          </a>
          <a href="mailto:priscillamukokobi@gmail.com" className="mt-3 flex items-center gap-3 text-sm text-sidebar-foreground/80 transition-colors hover:text-sidebar-foreground">
            <Mail className="size-4 shrink-0 text-sidebar-primary" />
            <span className="min-w-0 break-all">priscillamukokobi@gmail.com</span>
          </a>
        </div>

      </div>

      <div className="border-t border-sidebar-border">
        <div className="mx-auto max-w-7xl px-5 py-5 text-center text-xs text-sidebar-foreground/70 lg:px-8">
          © Her Namibia. All Rights Reserved. • Empowering women through storytelling.
        </div>

        <div className="mx-auto max-w-7xl border-t border-sidebar-border px-5 py-4 text-center text-xs text-sidebar-foreground/70 lg:px-8">
          Developed by{" "}
          <span className="relative inline-block">
            <button
              type="button"
              onClick={() => setDevMenuOpen((v) => !v)}
              className="font-semibold text-sidebar-foreground underline-offset-2 transition-colors hover:text-sidebar-primary hover:underline"
            >
              Saya Mubiana
            </button>

            {devMenuOpen && (
              <div className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-xl border border-sidebar-border bg-background p-2 text-left shadow-lg">
                <a
                  href={`mailto:${DEV_EMAIL}`}
                  onClick={() => setDevMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Mail className="size-4 shrink-0 text-sidebar-primary" />
                  <span className="truncate">{DEV_EMAIL}</span>
                </a>
                <a
                  href={DEV_WEBSITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setDevMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <ExternalLink className="size-4 shrink-0 text-sidebar-primary" />
                  <span className="truncate">My Website</span>
                </a>
              </div>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
