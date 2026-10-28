import { useEffect, useRef, useState } from "react";
import { LogOut, Sparkles } from "lucide-react";
import { Badge, CtaButton } from "../../components/ds/index";
import { uiMessage } from "../../i18n/ui-messages";
import {
  fetchAuthConfig,
  fetchSession,
  signInWithGoogle,
  signOut,
  startDemo,
  type AuthConfig,
  type AuthSession,
  type Role,
} from "../../adapters/browser/auth-client";

/* ═══ D-046 / D-047 — Account nel profilo ═══
 * Chi non ha fatto l'accesso vede «Accedi con Google» (pulsante ufficiale di
 * Google Identity Services) e «Prova la demo». Chi è dentro vede nome, email e
 * ruolo riconosciuto dall'app (admin, editor, tester, utente, demo). */

interface GoogleIdApi {
  accounts: {
    id: {
      initialize(options: { client_id: string; callback: (r: { credential: string }) => void }): void;
      renderButton(el: HTMLElement, options: Record<string, string | number>): void;
    };
  };
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleIdentity(): Promise<GoogleIdApi> {
  const existing = (window as unknown as { google?: GoogleIdApi }).google;
  if (existing?.accounts?.id) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () => resolve((window as unknown as { google: GoogleIdApi }).google);
    script.onerror = () => reject(new Error("google identity not loaded"));
    document.head.appendChild(script);
  });
}

function roleLabel(role: Role): string {
  switch (role) {
    case "admin":
      return uiMessage("features.account.account-panel.roleAdmin");
    case "editor":
      return uiMessage("features.account.account-panel.roleEditor");
    case "tester":
      return uiMessage("features.account.account-panel.roleTester");
    case "demo":
      return uiMessage("features.account.account-panel.roleDemo");
    default:
      return uiMessage("features.account.account-panel.roleUser");
  }
}

export function AccountPanel({ locale }: { locale: string }) {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchAuthConfig(), fetchSession()]).then(([cfg, me]) => {
      if (!alive) return;
      setConfig(cfg);
      setSession(me);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const clientId = config?.google?.clientId;
  useEffect(() => {
    if (!clientId || session || !googleButtonRef.current) return;
    let cancelled = false;
    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !googleButtonRef.current) return;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            const next = await signInWithGoogle(credential);
            setFailed(!next);
            if (next) setSession(next);
          },
        });
        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "signin_with",
          locale,
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [clientId, session, locale]);

  if (!loaded) return null;

  if (session) {
    return (
      <section className="account-panel" aria-labelledby="account-panel-title">
        <h2 id="account-panel-title" className="account-panel__title">
          {session.role === "demo"
            ? uiMessage("features.account.account-panel.demoTitle")
            : uiMessage("features.account.account-panel.signedInAs", [session.name ?? session.email ?? ""])}
        </h2>
        <p className="account-panel__meta">
          {session.email && <span data-region="email">{session.email}</span>}
          <Badge tone={session.role === "admin" ? "cta" : "muted"}>
            {roleLabel(session.role)}
          </Badge>
        </p>
        {session.role === "demo" && (
          <p className="account-panel__note">{uiMessage("features.account.account-panel.demoNote")}</p>
        )}
        <CtaButton
          type="button"
          variant="secondary"
          radius="pill"
          className="account-panel__action"
          onClick={async () => {
            await signOut(session);
            setSession(null);
            if (session.role === "demo") window.location.reload();
          }}
        >
          <LogOut size={15} aria-hidden="true" />
          {session.role === "demo"
            ? uiMessage("features.account.account-panel.endDemo")
            : uiMessage("features.account.account-panel.signOut")}
        </CtaButton>
      </section>
    );
  }

  return (
    <section className="account-panel" aria-labelledby="account-panel-title">
      <h2 id="account-panel-title" className="account-panel__title">
        {uiMessage("features.account.account-panel.signInTitle")}
      </h2>
      <p className="account-panel__note">{uiMessage("features.account.account-panel.signInBody")}</p>
      {clientId ? (
        <div ref={googleButtonRef} className="account-panel__google" data-region="google-button" />
      ) : (
        <p className="account-panel__note">{uiMessage("features.account.account-panel.googleOff")}</p>
      )}
      {config?.demo && (
        <CtaButton
          type="button"
          variant="secondary"
          radius="pill"
          className="account-panel__action"
          onClick={async () => {
            const next = await startDemo();
            setFailed(!next);
            if (next) setSession(next);
          }}
        >
          <Sparkles size={18} aria-hidden="true" />
          {uiMessage("features.account.account-panel.tryDemo")}
        </CtaButton>
      )}
      {failed && (
        <p className="account-panel__error" role="alert">
          {uiMessage("features.account.account-panel.error")}
        </p>
      )}
    </section>
  );
}
