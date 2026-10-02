import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const LOCK_KEY = "her_namibia_admin_lock";
const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60 * 1000;

export const Route = createFileRoute("/staff-access-her-namibia")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Access | Her Namibia" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Her Namibia admin portal." },
    ],
  }),
  component: StaffAccess,
});

type LockState = { failures: number; until: number };

function readLock(): LockState {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return { failures: 0, until: 0 };
    return JSON.parse(raw) as LockState;
  } catch {
    return { failures: 0, until: 0 };
  }
}

function StaffAccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(0);

  useEffect(() => {
    setLockedUntil(readLock().until);
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void navigate({ to: "/HerNamibia-admin" });
    });
  }, [navigate]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const lock = readLock();
    if (lock.until > Date.now()) {
      const mins = Math.ceil((lock.until - Date.now()) / 60000);
      toast.error(`Too many failed attempts. Try again in ${mins} minute(s).`);
      return;
    }

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email || !password) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      const failures = lock.failures + 1;
      const until = failures >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0;
      localStorage.setItem(
        LOCK_KEY,
        JSON.stringify({ failures: until ? 0 : failures, until } satisfies LockState),
      );
      setLockedUntil(until);
      toast.error(
        until ? "Too many failed attempts. Access locked for 5 minutes." : "Invalid credentials.",
      );
      return;
    }

    localStorage.removeItem(LOCK_KEY);
    void navigate({ to: "/HerNamibia-admin" });
  };

  const locked = lockedUntil > Date.now();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5 py-16">
      <div className="animate-scale-in w-full max-w-sm rounded-2xl border-2 border-primary bg-card p-8 shadow-lift">
        <div className="flex justify-center">
          <img src="/her-namibia-logo.png" alt="Her Namibia logo" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="mt-5 text-center text-lg font-bold">Admin Access</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Her Namibia admin portal.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="Email"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading || locked}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gradient py-3 text-sm font-semibold text-accent-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
          >
            <Lock className="size-4" />
            {loading ? "Verifying..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
