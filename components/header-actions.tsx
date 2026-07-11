"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, LogIn, LogOut, Share2, UserRound, X } from "lucide-react";

type MockUser = {
  name: string;
  email: string;
};

const storageKey = "agent-arena-user";

export function HeaderActions() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [shareUrl, setShareUrl] = useState("http://localhost:3000");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      setUser(JSON.parse(raw) as MockUser);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const initials = useMemo(() => {
    if (!user) return null;
    const parts = user.name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const login = (formData: FormData) => {
    const nextUser = {
      name: String(formData.get("name") || "Agent Builder"),
      email: String(formData.get("email") || "builder@agentarena.local")
    };
    window.localStorage.setItem(storageKey, JSON.stringify(nextUser));
    setUser(nextUser);
    setLoginOpen(false);
    setAccountOpen(false);
  };

  const logout = () => {
    window.localStorage.removeItem(storageKey);
    setUser(null);
    setAccountOpen(false);
  };

  return (
    <div className="flex items-center justify-end gap-s-3">
      <button
        className="inline-flex items-center gap-s-2 rounded-r-md border border-border bg-bg-elev px-s-6 py-s-2 font-bold text-fg transition-colors duration-fast ease-ease-out hover:bg-bg-sunken"
        type="button"
        onClick={() => setShareOpen(true)}
      >
        <Share2 size={18} />
        Share
      </button>
      <div className="relative">
        <button
          className="inline-flex items-center gap-s-2 rounded-r-md border border-border bg-bg-elev px-s-2 py-s-2 font-bold text-fg"
          type="button"
          aria-label="Account menu"
          aria-expanded={accountOpen}
          onClick={() => setAccountOpen((open) => !open)}
        >
          <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-bg-sunken font-bold text-fg">
            {initials ?? <UserRound size={18} />}
          </span>
          <ChevronDown size={16} />
        </button>
        {accountOpen ? (
          <div className="absolute right-0 top-[calc(100%+10px)] z-50 grid w-[250px] gap-s-2 rounded-r-md border border-border bg-bg-elev p-s-3 shadow-shadow-2">
            {user ? (
              <>
                <div className="grid gap-s-1 rounded-r-md bg-bg-sunken p-s-2">
                  <strong className="text-sm">{user.name}</strong>
                  <span className="text-xs text-fg-muted">{user.email}</span>
                </div>
                <a
                  href="/agent/viral-designer/passport"
                  className="flex min-h-[38px] items-center gap-s-2 rounded-r-md px-s-2 font-bold hover:bg-bg-sunken"
                >
                  Open Passport
                </a>
                <a
                  href="/battles"
                  className="flex min-h-[38px] items-center gap-s-2 rounded-r-md px-s-2 font-bold hover:bg-bg-sunken"
                >
                  Battle History
                </a>
                <button
                  type="button"
                  className="flex min-h-[38px] items-center gap-s-2 rounded-r-md px-s-2 font-bold hover:bg-bg-sunken"
                  onClick={logout}
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <div className="grid gap-s-1 rounded-r-md bg-bg-sunken p-s-2">
                  <strong className="text-sm">Guest Builder</strong>
                  <span className="text-xs text-fg-muted">Login stores a local MVP session.</span>
                </div>
                <button
                  type="button"
                  className="flex min-h-[38px] items-center gap-s-2 rounded-r-md px-s-2 font-bold hover:bg-bg-sunken"
                  onClick={() => setLoginOpen(true)}
                >
                  <LogIn size={16} />
                  Log in
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>

      {shareOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-fg/40 p-s-6 backdrop-blur"
          role="presentation"
          onMouseDown={() => setShareOpen(false)}
        >
          <div
            className="relative grid w-full max-w-[560px] gap-s-3 rounded-r-md border border-border bg-bg-elev p-s-8 shadow-shadow-3"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-s-3 top-s-3 grid h-[34px] w-[34px] place-items-center rounded-r-md border border-border bg-bg-elev"
              type="button"
              aria-label="Close share dialog"
              onClick={() => setShareOpen(false)}
            >
              <X size={18} />
            </button>
            <h2 id="share-title" className="m-0 font-bold text-fg">
              Share this arena view
            </h2>
            <p className="m-0 text-fg-muted">
              Copy the current route and send it to a teammate or judge.
            </p>
            <div className="grid grid-cols-[1fr_auto] items-center gap-s-2 rounded-r-md border border-border bg-bg-sunken p-s-2">
              <span className="truncate text-fg-muted">{shareUrl}</span>
              <button
                type="button"
                className="inline-flex items-center gap-s-2 rounded-r-md border border-border bg-bg-elev px-s-3 py-s-2 font-bold"
                onClick={copyShareLink}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {loginOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-fg/40 p-s-6 backdrop-blur"
          role="presentation"
          onMouseDown={() => setLoginOpen(false)}
        >
          <form
            className="relative grid w-full max-w-[560px] gap-s-3 rounded-r-md border border-border bg-bg-elev p-s-8 shadow-shadow-3"
            action={login}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-s-3 top-s-3 grid h-[34px] w-[34px] place-items-center rounded-r-md border border-border bg-bg-elev"
              type="button"
              aria-label="Close login dialog"
              onClick={() => setLoginOpen(false)}
            >
              <X size={18} />
            </button>
            <h2 id="login-title" className="m-0 font-bold text-fg">
              Log in locally
            </h2>
            <p className="m-0 text-fg-muted">
              This MVP stores a mock user in your browser so account UI can be exercised before real auth.
            </p>
            <label className="grid gap-s-1 font-bold text-fg">
              Name
              <input
                name="name"
                defaultValue="Agent Builder"
                className="min-h-[44px] rounded-r-md border border-border px-s-3 outline-none focus:border-team-safe"
              />
            </label>
            <label className="grid gap-s-1 font-bold text-fg">
              Email
              <input
                name="email"
                type="email"
                defaultValue="builder@agentarena.local"
                className="min-h-[44px] rounded-r-md border border-border px-s-3 outline-none focus:border-team-safe"
              />
            </label>
            <button
              className="inline-flex items-center justify-center gap-s-2 rounded-r-md bg-team-safe px-s-6 py-s-3 font-bold text-white"
              type="submit"
            >
              <LogIn size={16} />
              Continue
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
