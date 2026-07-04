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

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      setUser(JSON.parse(raw) as MockUser);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const shareUrl = typeof window === "undefined" ? "http://localhost:3000" : window.location.href;
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
    <div className="top-actions">
      <button className="ghost-button" type="button" onClick={() => setShareOpen(true)}>
        <Share2 size={18} />
        Share
      </button>
      <div className="account-wrap">
        <button
          className="avatar-button"
          type="button"
          aria-label="Account menu"
          aria-expanded={accountOpen}
          onClick={() => setAccountOpen((open) => !open)}
        >
          <span className="user-avatar">{initials ?? <UserRound size={18} />}</span>
          <ChevronDown size={16} />
        </button>
        {accountOpen ? (
          <div className="account-menu">
            {user ? (
              <>
                <div className="account-card">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <a href="/agent/viral-designer/passport">Open Passport</a>
                <a href="/battles">Battle History</a>
                <button type="button" onClick={logout}>
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <div className="account-card">
                  <strong>Guest Builder</strong>
                  <span>Login stores a local MVP session.</span>
                </div>
                <button type="button" onClick={() => setLoginOpen(true)}>
                  <LogIn size={16} />
                  Log in
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>

      {shareOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShareOpen(false)}>
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="share-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close share dialog" onClick={() => setShareOpen(false)}>
              <X size={18} />
            </button>
            <h2 id="share-title">Share this arena view</h2>
            <p>Copy the current route and send it to a teammate or judge.</p>
            <div className="copy-box">
              <span>{shareUrl}</span>
              <button type="button" onClick={copyShareLink}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {loginOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setLoginOpen(false)}>
          <form className="modal-panel login-panel" action={login} role="dialog" aria-modal="true" aria-labelledby="login-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close login dialog" onClick={() => setLoginOpen(false)}>
              <X size={18} />
            </button>
            <h2 id="login-title">Log in locally</h2>
            <p>This MVP stores a mock user in your browser so account UI can be exercised before real auth.</p>
            <label>
              Name
              <input name="name" defaultValue="Agent Builder" />
            </label>
            <label>
              Email
              <input name="email" type="email" defaultValue="builder@agentarena.local" />
            </label>
            <button className="primary-action button-reset" type="submit">
              <LogIn size={16} />
              Continue
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
