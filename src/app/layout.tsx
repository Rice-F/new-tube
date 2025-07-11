import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import {Inter} from "next/font/google";
import {ClerkProvider} from "@clerk/nextjs";

import { TRPCProvider } from "@/trpc/client";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Close Sea",
  description: "A close source sea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // afterSignOutUrl 注销后重定向至首页
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        {/* className={`${geistSans.variable} ${geistMono.variable} antialiased`} */}
        <body
          className={inter.className}
        >
          <TRPCProvider>
            <Toaster />
            {children}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
