import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/site-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sarthak Group Tuition | Excellence in Education",
  description: "Premier coaching classes for students. Expert faculty, comprehensive courses, and personalized learning. Enroll now for Classes 6-12, JEE, NEET preparation and more.",
  keywords: "coaching classes, tuition, education, JEE, NEET, Class 6-12, best tuition near me",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

