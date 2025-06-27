import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientSessionProvider from "@/components/ClientSessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Job Board",
  description: "Find your next job or hire the best talent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ClientSessionProvider>{children}</ClientSessionProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
