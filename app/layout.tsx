import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FJP Flow",
  description: "Sua rota inteligente para organizar e realizar o dia.",
  manifest: "/manifest.webmanifest",
  applicationName: "FJP Flow",
  appleWebApp: { capable: true, title: "FJP Flow", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = { themeColor: "#071c2f", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
