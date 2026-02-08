import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script, Playfair_Display } from "next/font/google";
import "./globals.css";

import { ConferenceProvider } from "@/context/ConferenceContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { SyncWrapper } from "@/components/SyncWrapper";
import { DevServiceWorkerUnregister } from "@/components/DevServiceWorkerUnregister";

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
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${playfairDisplay.variable} antialiased`}
      >
        <SyncWrapper>
          <ConferenceProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
            {process.env.NODE_ENV === 'development' && <DevServiceWorkerUnregister />}
          </ConferenceProvider>
        </SyncWrapper>
      </body>
    </html>
  );
}
