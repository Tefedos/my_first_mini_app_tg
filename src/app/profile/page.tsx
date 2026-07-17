"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const userId = window.localStorage.getItem("miniAppUserId");

    router.replace(userId ? `/profile/${userId}` : "/registration");
  }, [router]);

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <header className="profile-topbar">
          <h1>Профиль</h1>
        </header>
        <p className="profile-load-error">Открываем профиль...</p>
      </div>
    </main>
  );
}
