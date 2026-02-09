import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script, Playfair_Display, Syne, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ConferenceProvider } from "@/context/ConferenceContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { SyncWrapper } from "@/components/SyncWrapper";
import { DevServiceWorkerUnregister } from "@/components/DevServiceWorkerUnregister";
import { DynamicTheme } from "@/components/theme/DynamicTheme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  weight: "400",
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});



export const metadata: Metadata = {
  title: "CHERRY-K-2 | Congreso Internacional",
  description: "Plataforma de Gestión de Asistencia y Eventos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cherry-K",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/assets/fesa.png",
    apple: "/assets/fesa.png",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${playfairDisplay.variable} ${syne.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <SyncWrapper>
          <Suspense fallback={null}>
            <ConferenceProvider>
              <DynamicTheme />
              <SidebarProvider>
                {children}
              </SidebarProvider>
              {process.env.NODE_ENV === 'development' && <DevServiceWorkerUnregister />}
            </ConferenceProvider>
          </Suspense>
        </SyncWrapper>
      </body>
    </html>
  );
}
