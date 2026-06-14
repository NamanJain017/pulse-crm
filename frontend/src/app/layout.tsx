import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { Providers } from "./providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "PULSE CRM — AI-native Mini CRM for KORA",
  description: "Reach the right shoppers with the right message, automatically.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-base text-text-primary antialiased">
        <Providers>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-60 min-h-screen">
              <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
