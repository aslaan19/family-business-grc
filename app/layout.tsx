import type { Metadata } from "next";
import { LanguageProvider } from "./lib/language-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Business GRC | كرام للاستشارات",
  description:
    "رحلتك نحو التميز المؤسسي العائلي - حلول الحوكمة والمخاطر والامتثال للأعمال العائلية",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased">
        <a className="skip-link" href="#main-content">
          Skip to content / انتقل للمحتوى
        </a>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
