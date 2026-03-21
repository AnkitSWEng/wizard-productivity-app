// /app/page.tsx
"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="h-screen flex items-center justify-center">
      <button
        onClick={() => signIn("google")}
        className="px-6 py-3 bg-white text-black rounded"
      >
        Login with Google
      </button>
    </main>
  );
}