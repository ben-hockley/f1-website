import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import Header from "@/components/Header";
import { getAllConstructorsDirectory, getAllDriversDirectory } from "@/lib/api";
import type { ConstructorDirectoryEntry, DriverDirectoryEntry } from "@/lib/types";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "F1 Pulse",
    template: "%s | F1 Pulse",
  },
  description: "Modern Formula 1 hub with race results and championship standings.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let driverOptions: DriverDirectoryEntry[] = [];
  let constructorOptions: ConstructorDirectoryEntry[] = [];

  try {
    [driverOptions, constructorOptions] = await Promise.all([
      getAllDriversDirectory(),
      getAllConstructorsDirectory(),
    ]);
  } catch (error) {
    console.error("Header directory fetch failed:", error);
  }

  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable} antialiased`}>
        <Header driverOptions={driverOptions} constructorOptions={constructorOptions} />
        {children}
      </body>
    </html>
  );
}
