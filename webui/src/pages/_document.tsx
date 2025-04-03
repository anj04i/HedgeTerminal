import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>HedgeTerminal</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta
          name="description"
          content="HedgeTerminal is a professional-grade research interface for decoding capital flows and fund positioning."
        />
        <meta
          property="og:title"
          content="HedgeTerminal - Institutional-Grade Fund Intelligence"
        />
        <meta
          property="og:description"
          content="Built for serious capital. A next-gen terminal for fund behavior, filings, and quarterly data."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hedgeterminal.com" />
        <meta
          property="og:image"
          content="https://hedgeterminal.com/og-banner.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="HedgeTerminal - Institutional-Grade Fund Intelligence"
        />
        <meta
          name="twitter:description"
          content="Not a SaaS. Not a toy. Just pure research performance."
        />
        <meta
          name="twitter:image"
          content="https://hedgeterminal.com/og-banner.png"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body style={{ backgroundColor: '#0d0d0d' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
