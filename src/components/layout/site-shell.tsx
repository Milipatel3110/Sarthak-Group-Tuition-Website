"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import SarthakAIChatbot from "@/components/chatbot/sarthak-ai";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isPortal = pathname?.startsWith("/portal");

  if (isAdmin || isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SarthakAIChatbot />
    </>
  );
}
