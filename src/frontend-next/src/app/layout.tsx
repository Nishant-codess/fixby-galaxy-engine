import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fixby — Autonomous Galaxy Troubleshooting",
  description: "Engine for Samsung PRISM GenAI Hackathon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Sora:wght@400;600;700;800&family=Geist:wght@400;500;600&family=Hanken+Grotesk:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard-dynamic-subset.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {/*
          This script is inlined directly in the body so the browser runs it
          synchronously BEFORE it paints anything. It checks sessionStorage and
          stamps a class on <html>, which CSS uses to hide the landing layer
          immediately — eliminating the flash.
        */}
        <script
           
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    if (sessionStorage.getItem('fixby_mode') === 'console') {
      document.documentElement.classList.add('fixby-console-mode');
    }
  } catch(e) {}
})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
