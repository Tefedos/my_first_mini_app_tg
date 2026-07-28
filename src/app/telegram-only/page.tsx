function TelegramIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 96 96" aria-hidden="true">
      <path
        d="M82.6 17.3 68.2 80.1c-1 4.5-3.8 5.6-7.7 3.5L38.7 67.5 28.2 77.6c-1.2 1.2-2.2 2.2-4.5 2.2l1.6-22.5 41-37c1.8-1.6-.4-2.5-2.8-.9L12.8 51.2-9 44.4c-4.4-1.4-4.5-4.4.9-6.5l85-32.7c3.9-1.4 7.4.9 5.7 12.1z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function TelegramOnlyPage() {
  return (
    <main className="telegram-only-page">
      <div aria-hidden="true" className="telegram-only-sigil">
        <span className="telegram-only-ring telegram-only-ring-outer" />
        <span className="telegram-only-ring telegram-only-ring-middle" />
        <span className="telegram-only-ring telegram-only-ring-inner" />
        <span className="telegram-only-axis telegram-only-axis-vertical" />
        <span className="telegram-only-axis telegram-only-axis-horizontal" />
        <span className="telegram-only-point telegram-only-point-top" />
        <span className="telegram-only-point telegram-only-point-right" />
        <span className="telegram-only-point telegram-only-point-bottom" />
        <span className="telegram-only-point telegram-only-point-left" />
      </div>

      <section className="telegram-only-content" aria-label="Сайт доступен только из Telegram">
        <div className="telegram-only-icon-orbit" aria-hidden="true">
          <TelegramIcon className="telegram-only-main-icon" />
        </div>

        <h1>
          Сайт доступен
          <span>
            только из <strong>Telegram</strong>
          </span>
        </h1>

        <p>
          Для доступа ко всем функциям
          <span>перейдите в нашего бота в Telegram.</span>
        </p>

        <div aria-hidden="true" className="telegram-only-divider">
          <span />
        </div>

        <a
          className="telegram-only-button"
          href="https://t.me/dota_mini_bot"
          rel="noreferrer"
          target="_blank"
        >
          <TelegramIcon className="telegram-only-button-icon" />
          <span>
            <strong>Перейти в Telegram</strong>
            <small>@dota_mini_bot</small>
          </span>
        </a>
      </section>

      <div aria-hidden="true" className="coming-landscape telegram-only-landscape">
        <span className="coming-mountains coming-mountains-back" />
        <span className="coming-mountains coming-mountains-front" />
        <span className="coming-castle" />
        <span className="coming-forest coming-forest-left" />
        <span className="coming-forest coming-forest-right" />
        <span className="coming-river" />
      </div>
    </main>
  );
}
