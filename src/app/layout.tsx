import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "F1 Dashboard",
  description: "Formula 1 results and statistics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-[#15151E] text-white`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
