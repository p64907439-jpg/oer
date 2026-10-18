import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OER — Open Education Resources",
    template: "%s · OER",
  },
  description:
    "Teachers share lessons and materials. Students browse, view and download — no account needed.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "OER",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // The app is light-only — the status bar should match the page top
  // (not the OS theme) in both schemes.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#fafafa" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Keep the page above the on-screen keyboard on Android.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
