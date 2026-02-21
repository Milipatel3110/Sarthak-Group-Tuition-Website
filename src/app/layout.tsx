import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import SarthakAIChatbot from "@/components/chatbot/sarthak-ai";

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
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <SarthakAIChatbot />
      </body>
    </html>
  );
}

