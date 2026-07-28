"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type IconName =
  | "arrow"
  | "coin"
  | "cube"
  | "edit"
  | "home"
  | "lock"
  | "meme"
  | "party"
  | "plus"
  | "profile"
  | "settings"
  | "spear";

type ProfileUser = {
  avatar: {
    avatarsUrl: string;
    id: number;
  } | null;
  avatarId: number | null;
  coins: number;
  id: number;
  loveHero: {
    heroName: string;
    id: number;
  } | null;
  loveHeroId: number | null;
  lovePos: {
    id: number;
    pos: string;
  } | null;
  lovePosId: number | null;
  name: string;
};

const navItems: Array<{ icon: IconName; label: string; active?: boolean }> = [
  { icon: "home", label: "Главная" },
  { icon: "party", label: "Пати" },
  { icon: "cube", label: "Рандомайзер" },
  { icon: "meme", label: "Мемы" },
  { icon: "profile", label: "Профиль", active: true },
];

function Icon({ name }: { name: IconName }) {
  if (name === "coin") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="#f2a820" />
        <circle cx="24" cy="24" r="15" fill="none" stroke="#7c3e08" strokeWidth="3" />
        <path
          d="M24 13l4 7 8-3-4 9 4 8H12l4-8-4-9 8 3 4-7z"
          fill="#7c3e08"
          opacity=".72"
        />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M14 32l2 2 17-17-2-2-17 17z" fill="currentColor" />
        <path d="M28 12l3-3 8 8-3 3-8-8zM12 36l8-2-6-6-2 8z" fill="currentColor" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M21 5h6l2 6 5 2 6-3 3 5-4 5v6l4 5-3 5-6-3-5 2-2 6h-6l-2-6-5-2-6 3-3-5 4-5v-6l-4-5 3-5 6 3 5-2 2-6z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <circle cx="24" cy="24" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }

  if (name === "spear") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 34c12-15 20-23 32-26-4 10-12 20-26 32l1-9-7 3z" fill="currentColor" />
        <path d="M24 25l12 12" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="11" y="21" width="26" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M16 21v-6a8 8 0 0116 0v6" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M24 28v6" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 10v28M10 24h28" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M18 10l14 14-14 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M7 24L24 9l17 15v18H30V30H18v12H7V24z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="3" />
      </svg>
    );
  }

  if (name === "party") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="17" cy="18" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="32" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M6 40c2-8 8-12 15-12s12 4 14 12M27 32c4 0 8 3 10 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    );
  }

  if (name === "cube") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 5l17 10v18L24 43 7 33V15L24 5z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="3" />
        <path d="M7 15l17 10 17-10M24 25v18" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="18" cy="16" r="2" fill="currentColor" />
        <circle cx="29" cy="14" r="2" fill="currentColor" />
        <circle cx="29" cy="29" r="2" fill="currentColor" />
      </svg>
    );
  }

  if (name === "meme") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="18" cy="20" r="2.5" fill="currentColor" />
        <circle cx="30" cy="20" r="2.5" fill="currentColor" />
        <path d="M16 30c4 5 12 5 16 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M9 42c3-10 9-16 15-16s12 6 15 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function ProfileAvatar({
  compact = false,
  src,
}: {
  compact?: boolean;
  src?: string | null;
}) {
  return (
    <div className={compact ? "profile-avatar profile-avatar-compact" : "profile-avatar"}>
      {src ? (
        <span className="profile-avatar-image-wrap">
          <Image
            alt=""
            className="profile-avatar-image"
            fill
            sizes={compact ? "78px" : "112px"}
            src={src}
          />
        </span>
      ) : (
        <div className="profile-avatar-silhouette" />
      )}
      {!compact && (
        <span className="profile-edit-button" aria-hidden="true">
          <Icon name="edit" />
        </span>
      )}
    </div>
  );
}

function StatusPill({ color = "pink" }: { color?: "pink" | "purple" | "yellow" }) {
  return (
    <span className="profile-status-pill" aria-hidden="true">
      <span className={`profile-status-dot profile-status-${color}`} />
      <span />
      <span />
      <span />
    </span>
  );
}

function TaskSkeleton({ color }: { color: "pink" | "purple" | "yellow" }) {
  return (
    <div className="profile-task-row" aria-hidden="true">
      <span className="profile-task-thumb" />
      <span className="profile-task-lines">
        <span />
        <span />
      </span>
      <StatusPill color={color} />
    </div>
  );
}

function formatCoins(coins: number) {
  return new Intl.NumberFormat("ru-RU").format(coins);
}

export function ProfilePage({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const numericUserId = Number(userId);

        if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
          throw new Error("Invalid user id");
        }

        const webApp = window.Telegram?.WebApp;
        webApp?.ready();
        webApp?.expand();

        const initData = webApp?.initData;

        const response = await fetch(
          `/api/users/${numericUserId}`,
          {
            cache: "no-store",
            headers: initData ? { "x-telegram-init-data": initData } : undefined,
          },
        );
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error ?? "Profile not found");
        }

        if (cancelled) {
          return;
        }

        setProfile(data.user ?? null);

        if (data?.user?.id) {
          window.localStorage.setItem("miniAppUserId", String(data.user.id));
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setLoadError("Профиль пока не найден");
        setProfile(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profileView = useMemo(() => {
    const heroId = profile?.loveHero?.id ?? profile?.loveHeroId;
    const posId = profile?.lovePos?.id ?? profile?.lovePosId;

    return {
      avatarUrl: profile?.avatar?.avatarsUrl,
      coins: formatCoins(profile?.coins ?? 1000),
      heroName: profile?.loveHero?.heroName ?? (isLoading ? "Загрузка" : "Anti-Mage"),
      heroSubtitle: heroId ? `ID героя: ${heroId}` : "Сила ловкости",
      name: profile?.name ?? (isLoading ? "Загрузка" : "Артём"),
      posName: profile?.lovePos?.pos ?? (isLoading ? "Загрузка" : "Лёгкая"),
      posSubtitle: posId ? `ID позиции: ${posId}` : "Ваша основная позиция",
    };
  }, [isLoading, profile]);

  return (
    <>
      <main className="profile-page">
        <div className="profile-shell">
          <header className="profile-topbar">
            <h1>Профиль</h1>
            <button className="profile-icon-button" type="button" aria-label="Настройки">
              <Icon name="settings" />
            </button>
          </header>

          {loadError && <p className="profile-load-error">{loadError}</p>}

          <section className="profile-card profile-hero-card" aria-label="Профиль игрока">
            <ProfileAvatar src={profileView.avatarUrl} />
            <div className="profile-identity">
              <h2>{profileView.name}</h2>
              <div className="profile-guild-badge">
                <Icon name="spear" />
                <span>Воины таверны</span>
              </div>
              <div className="profile-coins">
                <span className="profile-coin-icon">
                  <Icon name="coin" />
                </span>
                <span className="profile-coin-copy">
                  <strong>{profileView.coins}</strong>
                  <span>монеток</span>
                </span>
              </div>
            </div>
          </section>

          <section className="profile-card profile-favorites-card" aria-label="Любимый герой и позиция">
            <div className="profile-favorite-hero">
              <p className="profile-section-label">Любимый герой</p>
              <div className="profile-hero-info">
                <ProfileAvatar compact />
                <div>
                  <h2>{profileView.heroName}</h2>
                  <p>{profileView.heroSubtitle}</p>
                </div>
              </div>
            </div>
            <div className="profile-position-info">
              <p className="profile-section-label">Позиция</p>
              <div className="profile-position-body">
                <span className="profile-position-icon">
                  <Icon name="spear" />
                </span>
                <div>
                  <h2>{profileView.posName}</h2>
                  <p>{profileView.posSubtitle}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-card profile-locked-card profile-tasks-card" aria-label="Мои задания">
            <div className="profile-card-heading">
              <h2>Мои задания</h2>
              <Icon name="lock" />
            </div>
            <div className="profile-blurred-list">
              <TaskSkeleton color="pink" />
              <TaskSkeleton color="purple" />
              <TaskSkeleton color="yellow" />
            </div>
            <p className="profile-lock-message">
              <Icon name="lock" />
              <span>Задания откроются позже</span>
            </p>
          </section>

          <section className="profile-card profile-locked-card profile-create-task-card" aria-label="Дать задание">
            <div className="profile-card-heading">
              <h2>Дать задание</h2>
              <Icon name="lock" />
            </div>
            <div className="profile-create-task-body">
              <span className="profile-add-placeholder">
                <Icon name="plus" />
              </span>
              <span className="profile-task-lines">
                <span />
                <span />
                <span />
              </span>
              <StatusPill color="pink" />
            </div>
            <p className="profile-lock-message">
              <Icon name="lock" />
              <span>Функция откроется позже</span>
            </p>
          </section>

          <section className="profile-card profile-locked-card profile-games-card" aria-label="Игры">
            <div className="profile-card-heading">
              <h2>Игры</h2>
              <Icon name="lock" />
            </div>
            <div className="profile-game-list">
              {[0, 1].map((row) => (
                <div className="profile-game-row" key={row}>
                  <span className="profile-game-thumb" />
                  <span className="profile-game-lines">
                    <span />
                    <span />
                  </span>
                  <span className="profile-game-dots">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="profile-arrow">
                    <Icon name="arrow" />
                  </span>
                </div>
              ))}
            </div>
            <p className="profile-lock-message">
              <Icon name="lock" />
              <span>Игры станут доступны позже</span>
            </p>
          </section>

          <nav className="profile-bottom-nav" aria-label="Основная навигация">
            {navItems.map((item) => (
              <a
                className={item.active ? "profile-nav-link profile-nav-link-active" : "profile-nav-link"}
                href="#"
                key={item.label}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </main>
    </>
  );
}
