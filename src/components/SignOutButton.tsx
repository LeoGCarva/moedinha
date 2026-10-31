"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export function SignOutButton({ className = "btn btn-ghost h-11" }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={signOut} disabled={pending} aria-busy={pending} className={className}>
      Sair
    </button>
  );
}
