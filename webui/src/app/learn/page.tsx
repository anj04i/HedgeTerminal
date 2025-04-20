import { darkTheme } from '@/components/views/theme';
export default function Learn() {
  return (
    <>
      <main
        className="min-h-screen px-6 pb-24 pt-32 relative select-none"
        style={{ backgroundColor: darkTheme.background, color: darkTheme.text }}
      >
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <radialGradient id="bgFade" cx="50%" cy="40%" r="75%">
                <stop offset="0%" stopColor="#0a150a" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bgFade)" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-8"
            style={{ color: darkTheme.accent }}
          >
            How It Works
          </h1>

          <p className="text-lg mb-8 text-[#aaa]">
            HedgeTerminal decodes 13F filings into high-resolution quarterly
            intelligence — surfacing allocation shifts, conviction patterns, and
            long-term positioning behavior.
          </p>

          <div className="grid gap-12">
            <section>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: darkTheme.text }}
              >
                Data Engine
              </h2>
              <p className="text-sm text-[#999] max-w-2xl">
                We parse every 13F-HR filing directly from EDGAR. No middlemen,
                no vendors. Our ETL pipeline normalizes fund activity across
                quarters, mapping CUSIP data to real-world tickers and
                classification systems.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: darkTheme.text }}
              >
                Analytics Framework
              </h2>
              <p className="text-sm text-[#999] max-w-2xl">
                From portfolio concentration to sector shifts, our metrics
                distill raw filings into intuitive indicators of style drift,
                alpha targeting, and macro pivots.
              </p>
            </section>

            <section>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: darkTheme.text }}
              >
                Terminal Design
              </h2>
              <p className="text-sm text-[#999] max-w-2xl">
                HedgeTerminal is built like a trading terminal — fast, focused,
                frictionless. Zero distractions, all signal.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
