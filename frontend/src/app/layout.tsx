import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
    default: "CampusBridge - Student Alumni Network & Placement Platform",
    template: "%s | CampusBridge"
  },
  description: "CampusBridge connects students and alumni for professional mentorship, job referrals, and campus placement tracking. Build your professional network today.",
  keywords: [
    "alumni management platform",
    "campus placement",
    "student alumni network",
    "mentorship platform",
    "referral system",
    "placement tracking",
    "CampusBridge",
    "career network",
    "professional mentorship",
    "college admin portal"
  ],
  authors: [{ name: "CampusBridge Team" }],
  creator: "CampusBridge",
  metadataBase: new URL("https://campusbridge.zinoingroup.in"),
  alternates: {
    canonical: "https://campusbridge.zinoingroup.in",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "CampusBridge - Student Alumni Network & Placement Platform",
    description: "The premium network connecting students, alumni, and colleges for career mentorship, job referrals, and campus placement tracking.",
    url: "https://campusbridge.zinoingroup.in",
    siteName: "CampusBridge",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "CampusBridge - Connecting Students & Alumni",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusBridge - Student Alumni Network & Placement Platform",
    description: "The premium network connecting students, alumni, and colleges for career mentorship, job referrals, and campus placement tracking.",
    images: ["/logo.png"],
    creator: "@CampusBridge",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml", sizes: "180x180" },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
