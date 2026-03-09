"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
        <a
          href="/dashboard"
          className="mt-4 inline-block text-sm text-primary underline hover:no-underline"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
