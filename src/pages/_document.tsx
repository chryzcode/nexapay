import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body
        // Suppress hydration errors from Grammarly extension
        suppressHydrationWarning={true}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 