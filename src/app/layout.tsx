import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hub'Eau - Qualité de l'Eau en France",
  description: "Consultez et comparez la qualité de l'eau potable de votre commune en temps réel avec les données officielles de Hub'Eau.",
  keywords: ["eau", "qualité", "potable", "france", "hubeau", "santé", "écologie"],
  authors: [{ name: "Kyworn" }],
  openGraph: {
    title: "Hub'Eau - Qualité de l'Eau en France",
    description: "Consultez et comparez la qualité de l'eau potable de votre commune en temps réel.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark h-full scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full font-sans antialiased bg-mesh`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
