import type { Metadata } from "next";
import { Inter, Chivo, JetBrains_Mono } from "next/font/google";
import Sidebar from "@/components/layout/sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const chivo = Chivo({
  variable: "--font-chivo",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forge OS — Mission Control",
  description: "Forge OS internal operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${chivo.variable} ${jetbrainsMono.variable} bg-forge-grid`}>
        <div style={{ display: "flex", height: "100vh", width: "100%" }}>
          <Sidebar />
          <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
