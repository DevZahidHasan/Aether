import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AETHER — Planetary Climate Intelligence",
  description:
    "A planetary climate intelligence application that treats the Earth itself as the primary interface.",
  applicationName: "AETHER",
  authors: [{ name: "AETHER Core Engineering" }],
  keywords: [
    "climate intelligence",
    "planetary data",
    "spatial computing",
    "climate visualization",
    "earth observation",
  ],
};

export const viewport: Viewport = {
  themeColor: "#17181c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-aether-bg text-aether-fg min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
