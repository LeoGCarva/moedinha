"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

type Provider = "google" | "github";

export function SocialButtons() {
  const [error, setError] = useState<string | null>(null);
  // Provedor clicado: fica em espera até o redirecionamento (ou volta a null se der erro).
  const [pending, setPending] = useState<Provider | null>(null);

  async function signIn(provider: Provider) {
    setError(null);
    setPending(provider);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/`,
      });
      if (error) {
        setError(error.message || "Falha no login social");
        setPending(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no login social");
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => signIn("google")}
          disabled={pending !== null}
          aria-busy={pending === "google"}
          className="btn btn-secondary flex-1 basis-44"
        >
          Entrar com Google
        </button>
        <button
          type="button"
          onClick={() => signIn("github")}
          disabled={pending !== null}
          aria-busy={pending === "github"}
          className="btn btn-secondary flex-1 basis-44"
        >
          Entrar com GitHub
        </button>
      </div>
      {error && <p role="alert" className="form-error">{error}</p>}
    </div>
  );
}
