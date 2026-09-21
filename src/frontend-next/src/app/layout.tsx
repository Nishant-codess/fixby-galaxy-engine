import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Fixby Galaxy Engine UI",
  description: "Samsung One UI simulator for Fixby NLP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
