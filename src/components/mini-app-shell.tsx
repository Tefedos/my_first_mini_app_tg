"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type Avatar = {
  id: number;
  avatarsUrl: string;
};

type Postion = {
  id: number;
  pos: string;
};

type Hero = {
  id: number;
  heroName: string;
};

type RegistrationForm = {
  avatarId: number | null;
  hero: Hero | null;
  name: string;
  postionId: number | null;
};

type RegistrationField = "avatarId" | "hero" | "name" | "postionId";

type RegistrationErrors = Partial<Record<RegistrationField, string>>;

type StepLabelProps = {
  icon: "hero" | "shield" | "user";
  text: string;
};

const roleIcons: Record<number, string> = {
  1: "⚔",
  2: "✦",
  3: "⬟",
  4: "❦",
  5: "✚",
};

const TELEGRAM_PROFILE_CHECK_TIMEOUT_MS = 4000;
const TELEGRAM_PROFILE_CHECK_INTERVAL_MS = 120;

const stepLabelStyle: CSSProperties = {
  alignItems: "center",
  color: "#f8fbff",
  display: "flex",
  filter: "drop-shadow(0 2px 2px rgb(2 8 24 / 0.75))",
  fontSize: 19,
  fontWeight: 700,
  gap: 11,
  lineHeight: 1,
  minHeight: 34,
  textShadow: "0 1px 1px rgb(2 8 24 / 0.95), 0 0 5px rgb(128 151 220 / 0.62)",
  WebkitFontSmoothing: "antialiased",
  WebkitTextStroke: "0 transparent",
};

const stepLabelTextStyle: CSSProperties = {
  display: "inline-block",
  transform: "translateY(0)",
};

const avatarStepIconStyle: CSSProperties = {
  borderRadius: "999px 999px 9px 9px",
  height: 17,
  width: 24,
};

const avatarStepIconHeadStyle: CSSProperties = {
  background: "inherit",
  borderRadius: 999,
  height: 12,
  left: 6,
  position: "absolute",
  top: -8,
  width: 12,
};

function StepIcon({ icon }: Pick<StepLabelProps, "icon">) {
  if (icon === "user") {
    return (
      <span
        aria-hidden="true"
        className="registration-step-icon"
        style={avatarStepIconStyle}
      >
        <i style={avatarStepIconHeadStyle} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`registration-step-icon registration-step-icon-${icon}`}
    />
  );
}

function StepLabel({ icon, text }: StepLabelProps) {
  return (
    <div className="registration-step-label" style={stepLabelStyle}>
      <StepIcon icon={icon} />
      <strong style={stepLabelTextStyle}>{text}</strong>
    </div>
  );
}

function validateRegistrationForm(
  form: RegistrationForm,
  heroQuery: string,
): RegistrationErrors {
  const nextErrors: RegistrationErrors = {};

  if (!form.avatarId) {
    nextErrors.avatarId = "Выберите аватар";
  }

  if (!form.name.trim()) {
    nextErrors.name = "Введите имя";
  }

  if (!form.postionId) {
    nextErrors.postionId = "Выберите любимую роль";
  }

  if (!form.hero) {
    nextErrors.hero = heroQuery.trim()
      ? "Выберите персонажа из списка"
      : "Выберите любимого персонажа";
  }

  return nextErrors;
}

function getTelegramInitData() {
  const initData = window.Telegram?.WebApp.initData;

  return typeof initData === "string" ? initData.trim() : "";
}

export function MiniAppShell() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [postions, setPostions] = useState<Postion[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(true);
  const [heroQuery, setHeroQuery] = useState("");
  const [heroSearchError, setHeroSearchError] = useState<string | null>(null);
  const [isHeroSearchFocused, setIsHeroSearchFocused] = useState(false);
  const [isExistingUserCheckLoading, setIsExistingUserCheckLoading] = useState(false);
  const [isRegistrationDataLoading, setIsRegistrationDataLoading] = useState(true);
  const [registrationDataError, setRegistrationDataError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [form, setForm] = useState<RegistrationForm>({
    avatarId: null,
    hero: null,
    name: "",
    postionId: null,
  });

  useEffect(() => {
    let cancelled = false;
    let hasStartedCheck = false;

    function stopPolling() {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    }

    async function redirectExistingTelegramUser(initData: string) {
      setIsExistingUserCheckLoading(true);

      try {
        const response = await fetch("/api/users/by-telegram", {
          cache: "no-store",
          headers: { "x-telegram-init-data": initData },
        });
        const data = await response.json().catch(() => null);

        if (response.status === 404) {
          return;
        }

        if (!response.ok) {
          throw new Error(data?.error ?? "Failed to check Telegram profile");
        }

        const userId = data?.user?.id;

        if (!cancelled && userId) {
          window.localStorage.setItem("miniAppUserId", String(userId));
          router.replace(`/profile/${userId}`);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
        }
      } finally {
        if (!cancelled) {
          setIsExistingUserCheckLoading(false);
        }
      }
    }

    function startCheckWhenInitDataIsReady() {
      if (cancelled || hasStartedCheck) {
        return;
      }

      const initData = getTelegramInitData();

      if (!initData) {
        return;
      }

      hasStartedCheck = true;
      stopPolling();
      void redirectExistingTelegramUser(initData);
    }

    const intervalId = window.setInterval(
      startCheckWhenInitDataIsReady,
      TELEGRAM_PROFILE_CHECK_INTERVAL_MS,
    );
    const timeoutId = window.setTimeout(
      stopPolling,
      TELEGRAM_PROFILE_CHECK_TIMEOUT_MS,
    );

    startCheckWhenInitDataIsReady();

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function loadRegistrationData() {
      setIsRegistrationDataLoading(true);
      setRegistrationDataError(null);

      try {
        const [avatarsResponse, postionsResponse] = await Promise.all([
          fetch("/api/avatars"),
          fetch("/api/postion"),
        ]);

        if (!avatarsResponse.ok || !postionsResponse.ok) {
          throw new Error("Failed to load registration data");
        }

        const [avatarsData, postionsData] = await Promise.all([
          avatarsResponse.json(),
          postionsResponse.json(),
        ]);

        if (cancelled) {
          return;
        }

        const nextAvatars = avatarsData.avatars ?? [];
        const nextPostions = postionsData.postions ?? [];

        setAvatars(nextAvatars);
        setPostions(nextPostions);
        setForm((current) => ({
          ...current,
          avatarId: current.avatarId ?? nextAvatars[0]?.id ?? null,
        }));

        if (nextAvatars.length === 0 || nextPostions.length === 0) {
          setRegistrationDataError("Не удалось загрузить аватары и роли");
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setRegistrationDataError("Не удалось загрузить аватары и роли");
        }
      } finally {
        if (!cancelled) {
          setIsRegistrationDataLoading(false);
        }
      }
    }

    void loadRegistrationData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const query = heroQuery.trim();

    if (query.length < 2) {
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/heroes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: query }),
        });

        if (!response.ok) {
          throw new Error("Failed to search heroes");
        }

        const data = await response.json();

        if (!cancelled) {
          setHeroes(data.heroes ?? []);
          setHeroSearchError(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setHeroes([]);
          setHeroSearchError("Не удалось найти персонажа");
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [heroQuery]);

  const selectedAvatar = useMemo(
    () => avatars.find((avatar) => avatar.id === form.avatarId) ?? avatars[0],
    [avatars, form.avatarId],
  );
  const selectedPostion = useMemo(
    () => postions.find((postion) => postion.id === form.postionId),
    [postions, form.postionId],
  );

  function clearError(field: RegistrationField) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateRegistrationForm(form, heroQuery);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const { avatarId, hero, postionId } = form;

    if (!avatarId || !hero || !postionId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const initData = window.Telegram?.WebApp.initData;
      const response = await fetch("/api/users", {
        body: JSON.stringify({
          avatarId,
          initData: initData || undefined,
          loveHeroId: hero.id,
          lovePosId: postionId,
          name: form.name.trim(),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmitError(
          data?.error ?? "Не получилось завершить регистрацию",
        );
        return;
      }

      const createdUserId = data?.user?.id;

      if (!createdUserId) {
        setSubmitError("Пользователь создан, но сервер не вернул id");
        return;
      }

      window.localStorage.setItem("miniAppUserId", String(createdUserId));

      window.Telegram?.WebApp.HapticFeedback?.notificationOccurred("success");
      router.push(`/profile/${createdUserId}`);
    } catch (error) {
      console.error(error);
      setSubmitError("Не получилось завершить регистрацию");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <main className="registration-page min-h-dvh px-4 py-8 text-slate-100">
        <section className="registration-panel mx-auto w-full max-w-[562px] px-8 py-9 sm:px-10">
          <header className="mb-8 text-center">
            <h1 className="text-[32px] font-bold leading-tight tracking-normal text-white">
              Регистрация
            </h1>
            <p className="mt-3 text-[17px] leading-6 text-[#93a3c3]">
              Создай свой профиль для начала игры
            </p>
            <div className="mx-auto mt-7 flex w-full max-w-[360px] items-center justify-center gap-3 opacity-45">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#315084] to-[#315084]" />
              <span className="grid size-7 rotate-45 place-items-center border border-[#315084]">
                <span className="size-2 bg-[#315084]" />
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#315084] to-[#315084]" />
            </div>
          </header>

          <form className="space-y-6" noValidate onSubmit={handleSubmit}>
            {isExistingUserCheckLoading && (
              <p className="text-center text-sm font-medium text-[#93a3c3]">
                Проверяем существующий профиль...
              </p>
            )}

            {registrationDataError && (
              <p className="registration-field-error text-center">
                {registrationDataError}. Проверьте, что база данных запущена.
              </p>
            )}

            <section className="space-y-4">
              <StepLabel icon="user" text="1. Аватарка" />
              <button
                aria-label="Выбрать аватар"
                aria-describedby={errors.avatarId ? "avatar-error" : undefined}
                className="mx-auto block"
                disabled={isRegistrationDataLoading || avatars.length === 0}
                type="button"
                onClick={() => setIsAvatarPickerOpen(true)}
              >
                <div
                  className={`relative size-[190px] ${
                    errors.avatarId ? "registration-avatar-invalid" : ""
                  }`}
                >
                  <span className="absolute inset-0 rounded-full border-[4px] border-[#426dff] shadow-[0_0_28px_rgba(50,96,255,0.55)]" />
                  {selectedAvatar ? (
                    <Image
                      alt=""
                      className="rounded-full object-cover"
                      fill
                      priority
                      sizes="190px"
                      src={selectedAvatar.avatarsUrl}
                    />
                  ) : (
                    <img
                      alt=""
                      className="size-full object-contain"
                      src="/ui-components/avatar_circle.png"
                    />
                  )}
                  <img
                    alt=""
                    className="absolute -bottom-1 -right-1 size-[64px]"
                    src="/ui-components/avatar_edit_button.png"
                  />
                </div>
              </button>
              <img
                alt="Нажмите, чтобы выбрать аватар"
                className="mx-auto h-[26px] w-auto opacity-90"
                src="/ui-components/avatar_hint_text.png"
              />
              {errors.avatarId && (
                <p className="registration-field-error text-center" id="avatar-error">
                  {errors.avatarId}
                </p>
              )}
            </section>

            <section className="space-y-3">
              <img
                alt="2. Имя"
                className="h-10 w-auto"
                src="/ui-components/input_label.png"
              />
              <input
                aria-describedby={errors.name ? "name-error" : undefined}
                aria-invalid={Boolean(errors.name)}
                className={`registration-input h-[60px] w-full px-7 text-[18px] ${
                  errors.name ? "registration-field-invalid" : ""
                }`}
                maxLength={32}
                placeholder="Введите ваше имя"
                value={form.name}
                onChange={(event) => {
                  clearError("name");
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }));
                }}
              />
              {errors.name && (
                <p className="registration-field-error" id="name-error">
                  {errors.name}
                </p>
              )}
            </section>

            <section className="space-y-3">
              <StepLabel icon="shield" text="3. Любимая роль" />
              <div
                className={`registration-select overflow-hidden ${
                  errors.postionId ? "registration-field-invalid" : ""
                }`}
              >
                <button
                  aria-describedby={errors.postionId ? "postion-error" : undefined}
                  disabled={isRegistrationDataLoading || postions.length === 0}
                  className="flex h-[58px] w-full items-center justify-between px-7 text-left text-[18px] text-[#dce7ff]"
                  type="button"
                  onClick={() => setIsRoleOpen((current) => !current)}
                >
                  <span>{selectedPostion?.pos ?? "Выберите роль"}</span>
                  <span className="text-2xl leading-none text-[#dce7ff]">⌄</span>
                </button>
                {isRoleOpen && (
                  <div className="space-y-1 px-5 pb-4">
                    {postions.map((postion) => (
                      <button
                        key={postion.id}
                        className="flex h-[52px] w-full items-center gap-5 rounded-lg px-1 text-left text-[18px] text-[#b9c5dd] transition hover:bg-white/5"
                        type="button"
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            postionId: postion.id,
                          }));
                          clearError("postionId");
                          setIsRoleOpen(false);
                        }}
                      >
                        <span className={`role-icon role-icon-${postion.id}`}>
                          {roleIcons[postion.id] ?? "•"}
                        </span>
                        <span>{postion.pos}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.postionId && (
                <p className="registration-field-error" id="postion-error">
                  {errors.postionId}
                </p>
              )}
            </section>

            <section className="space-y-3">
              <StepLabel icon="hero" text="4. Любимый персонаж" />
              <div className="relative">
                <span className="pointer-events-none absolute left-6 top-1/2 size-5 -translate-y-1/2 rounded-full border-[3px] border-[#687ca6] opacity-80" />
                <span className="pointer-events-none absolute left-[42px] top-[37px] h-[3px] w-4 rotate-45 rounded bg-[#687ca6]" />
                <input
                  aria-describedby={errors.hero ? "hero-error" : undefined}
                  aria-invalid={Boolean(errors.hero)}
                  className={`registration-input h-[58px] w-full px-14 text-[18px] ${
                    errors.hero ? "registration-field-invalid" : ""
                  }`}
                  placeholder="Введите имя персонажа"
                  value={heroQuery}
                  onBlur={() => window.setTimeout(() => setIsHeroSearchFocused(false), 120)}
                  onChange={(event) => {
                    const nextQuery = event.target.value;
                    setHeroQuery(nextQuery);
                    clearError("hero");
                    setForm((current) =>
                      current.hero?.heroName === nextQuery
                        ? current
                        : { ...current, hero: null },
                    );
                    if (nextQuery.trim().length < 2) {
                      setHeroes([]);
                      setHeroSearchError(null);
                    }
                    setIsHeroSearchFocused(true);
                  }}
                  onFocus={() => setIsHeroSearchFocused(true)}
                />
                {isHeroSearchFocused && heroes.length > 0 && (
                  <div className="registration-menu absolute left-0 right-0 top-[66px] z-20 max-h-56 overflow-y-auto p-2">
                    {heroes.map((hero) => (
                      <button
                        key={hero.id}
                        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-[#dce7ff] hover:bg-white/5"
                        type="button"
                        onClick={() => {
                          setForm((current) => ({ ...current, hero }));
                          setHeroQuery(hero.heroName);
                          clearError("hero");
                          setIsHeroSearchFocused(false);
                        }}
                      >
                        <span>{hero.heroName}</span>
                        <span className="text-sm text-[#8fa1c7]">#{hero.id}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <img
                alt="Начните вводить имя для поиска персонажа"
                className="h-[22px] w-auto opacity-90"
                src="/ui-components/character_name_hint.png"
              />
              {errors.hero && (
                <p className="registration-field-error" id="hero-error">
                  {errors.hero}
                </p>
              )}
              {heroSearchError && (
                <p className="registration-field-error">
                  {heroSearchError}. Проверьте, что база данных запущена.
                </p>
              )}
            </section>

            <section className="space-y-3">
              <img
                alt="5. Количество монет"
                className="h-10 w-auto"
                src="/ui-components/coins_label.png"
              />
              <img
                alt="1000 монеток на старте"
                className="w-full"
                src="/ui-components/coins_info_card.png"
              />
            </section>

            <button
              className={`register-button h-[76px] w-full text-[24px] font-bold text-white ${
                isSubmitting || isExistingUserCheckLoading ? "opacity-70" : ""
              }`}
              disabled={isSubmitting || isExistingUserCheckLoading}
              type="submit"
            >
              {isExistingUserCheckLoading
                ? "Проверяем профиль..."
                : isSubmitting
                  ? "Регистрируем..."
                  : "Зарегистрироваться"}
            </button>
            {submitError && (
              <p className="registration-field-error text-center">
                {submitError}
              </p>
            )}
          </form>
        </section>

        {isAvatarPickerOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-[#020817]/80 px-4 backdrop-blur-sm">
            <div className="registration-panel w-full max-w-md p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-white">Выберите аватар</h2>
                <button
                  className="rounded-lg px-3 py-2 text-[#aebad8] hover:bg-white/5"
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(false)}
                >
                  Закрыть
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    className={`avatar-option ${
                      avatar.id === form.avatarId ? "avatar-option-active" : ""
                    }`}
                    type="button"
                    onClick={() => {
                      setForm((current) => ({ ...current, avatarId: avatar.id }));
                      clearError("avatarId");
                      setIsAvatarPickerOpen(false);
                    }}
                  >
                    <Image
                      alt={`Аватар ${avatar.id}`}
                      className="rounded-full object-cover"
                      height={96}
                      src={avatar.avatarsUrl}
                      width={96}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
