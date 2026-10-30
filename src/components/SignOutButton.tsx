"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function SignOutButton({ className = "btn btn-ghost h-11" }: { className?: string }) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={signOut} className={className}>
      Sair
    </button>
  );
}
