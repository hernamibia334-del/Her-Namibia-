import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGO_URL = "/her-namibia-logo.png";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About Her Namibia", href: "/#about" },
  { label: "Our Stories", href: "/#stories" },
  { label: "Woman of the Month", href: "/#woman-of-month" },
  {
    label: "Featured",
    children: [
      { label: "News", href: "/news" },
      { label: "Articles", href: "/projects" },
      { label: "Resources", href: "/resources" },
      { label: "Podcast", href: "/podcast" },
    ],
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/" || location.pathname === "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobilePortfolioOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        isTransparent
          ? "bg-transparent py-1 pt-[max(0.25rem,env(safe-area-inset-top))]"
          : "bg-background/95 shadow-card backdrop-blur-md border-b border-border/40 py-0.5 pt-[max(0.125rem,env(safe-area-inset-top))]",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 lg:px-8">
        <a href="/" className="flex min-w-0 items-center transition-opacity hover:opacity-80">
          <img
            src={LOGO_URL}
            alt="Her Namibia logo"
            className={cn(
              "w-auto object-contain transition-all duration-500 drop-shadow-lg",
              isTransparent ? "h-12" : "h-10 sm:h-11",
            )}
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => {
            if ("children" in item) {
              return (
                <div key={item.label} className="group relative">
                  <button
                    type="button"
                    className={cn(
                      "nav-link text-[12px] xl:text-[13px] whitespace-nowrap font-semibold transition-all duration-300",
                      isTransparent
                        ? "text-primary hover:bg-primary/10 hover:text-primary"
                        : "text-primary hover:bg-secondary hover:text-accent",
                      "group-hover:bg-secondary group-hover:text-accent",
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className="size-3.5 transition-transform duration-300 group-hover:rotate-180"
                    />
                  </button>

                  {/* Dropdown - shown while the cursor is over the trigger or the menu */}
                  <div
                    className="pointer-events-none invisible absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <div className="min-w-[180px] rounded-xl border border-border/60 bg-background/98 p-1.5 shadow-lift backdrop-blur-md">
                      <div className="absolute -top-2 left-0 h-3 w-full" />
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "nav-link flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[12px] xl:text-[13px] font-semibold transition-all duration-300",
                            "text-primary hover:bg-secondary hover:text-accent",
                          )}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-link text-[12px] xl:text-[13px] whitespace-nowrap font-semibold transition-all duration-300",
                  isTransparent
                    ? "text-primary hover:bg-primary/10 hover:text-primary"
                    : "text-primary hover:bg-secondary hover:text-accent",
                )}
              >
                {item.label}
              </a>
            );
          })}
          <a
            href="mailto:priscillamukokobi@gmail.com"
            className="ml-2 rounded-full bg-accent-gradient px-5 py-2.5 text-[13px] font-semibold text-accent-foreground shadow-card transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            Share Your Story
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full border transition-colors duration-500 lg:hidden",
            isTransparent
              ? "border-primary/40 text-primary hover:bg-primary/20"
              : "border-border text-primary hover:bg-secondary",
          )}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "border-t border-border bg-background/98 backdrop-blur-md transition-[max-height,opacity] duration-500 lg:hidden",
          open
            ? "max-h-[min(40rem,calc(100dvh-5rem))] overflow-y-auto opacity-100"
            : "max-h-0 overflow-hidden opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-4">
          {NAV_ITEMS.map((item, i) => {
            if ("children" in item) {
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => setMobilePortfolioOpen((v) => !v)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
                    style={{ transitionDelay: `${i * 30}ms` }}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "ml-auto size-4 transition-transform duration-300",
                        mobilePortfolioOpen && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-[max-height,opacity] duration-300",
                      mobilePortfolioOpen
                        ? "max-h-72 opacity-100"
                        : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="ml-6 flex flex-col gap-1 border-l-2 border-border/60 pl-3 pt-1 pb-1">
                      {item.children.map((child, ci) => (
                        <a
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
                          style={{ transitionDelay: `${(i * 3 + ci) * 30}ms` }}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {item.label}
              </a>
            );
          })}
          <a
            href="mailto:priscillamukokobi@gmail.com"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-accent-gradient px-6 py-3 text-center text-sm font-semibold text-accent-foreground"
          >
            Share Your Story
          </a>
        </nav>
      </div>
    </header>
  );
}
