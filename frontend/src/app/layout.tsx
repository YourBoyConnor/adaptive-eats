import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AdaptiveEats - AI Recipe Adaptation",
  description: "Transform any recipe to fit your dietary needs with AI. Upload food images or paste recipes to get personalized adaptations for allergies, dietary restrictions, and more.",
  keywords: "recipe adaptation, dietary restrictions, food allergies, AI cooking, recipe modification, healthy eating",
  authors: [{ name: "AdaptiveEats" }],
  creator: "AdaptiveEats",
  publisher: "AdaptiveEats",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://adaptive-eats.vercel.app'),
  openGraph: {
    title: "AdaptiveEats - AI Recipe Adaptation",
    description: "Transform any recipe to fit your dietary needs with AI",
    url: 'https://adaptive-eats.vercel.app',
    siteName: 'AdaptiveEats',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'AdaptiveEats Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AdaptiveEats - AI Recipe Adaptation",
    description: "Transform any recipe to fit your dietary needs with AI",
    images: ['/logo.svg'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
