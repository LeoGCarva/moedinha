"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export function SocialButtons() {
  const [error, setError] = useState<string | null>(null);

  async function signIn(provider: "google" | "github") {
    setError(null);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/`,
      });
      if (error) setError(error.message || "Falha no login social");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no login social");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => signIn("google")} className="btn btn-secondary flex-1 basis-44">
          Entrar com Google
        </button>
        <button type="button" onClick={() => signIn("github")} className="btn btn-secondary flex-1 basis-44">
          Entrar com GitHub
        </button>
      </div>
      {error && <p role="alert" className="form-error">{error}</p>}
    </div>
  );
}
