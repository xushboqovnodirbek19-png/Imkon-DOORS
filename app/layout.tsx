import type { Metadata, Viewport } from "next";
import { Sora, Manrope, Space_Mono } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "./providers/TelegramProvider";

// IMKON type system: Sora (display), Manrope (body), Space Mono (labels/nums).
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IMKON Doors",
  description:
    "IMKON Doors — xavfsizlik eshiklari. Eshiklarni 3D'da ko'ring va " +
    "buyurtma bering.",
};

// Mini Apps render edge-to-edge inside Telegram; lock zoom for an app feel.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16130E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${sora.variable} ${manrope.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        {/* Telegram Web App runtime — required for initData + theming. */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className="min-h-full bg-ink text-cream">
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  );
}
