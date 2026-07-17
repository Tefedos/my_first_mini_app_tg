export default function ComingSoonPage() {
  return (
    <main className="coming-soon-page">
      <div aria-hidden="true" className="coming-soon-sigil">
        <span className="coming-ring coming-ring-outer" />
        <span className="coming-ring coming-ring-middle" />
        <span className="coming-ring coming-ring-inner" />
        <span className="coming-axis coming-axis-vertical" />
        <span className="coming-axis coming-axis-horizontal" />
        <span className="coming-center-diamond">
          <span />
        </span>
      </div>

      <section className="coming-soon-content" aria-label="Страница скоро появится">
        <h1>Скоро тут будет страница</h1>
        <div aria-hidden="true" className="coming-soon-divider">
          <span />
        </div>
      </section>

      <div aria-hidden="true" className="coming-landscape">
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
