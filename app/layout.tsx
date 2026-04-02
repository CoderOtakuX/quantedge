import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_SLOGAN } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${APP_NAME} | ${APP_SLOGAN}`,
  description: "Advanced financial data intelligence and stock screening platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-surface text-on-surface font-sans selection:bg-primary-container/20 selection:text-primary-container">
        {children}
      </body>
    </html>
  );
}
