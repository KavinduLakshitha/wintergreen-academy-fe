import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import ClientLayout from "./ClientLayout";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wintergreen Academy",
  description: "A comprehensive learning platform dedicated to training and empowering caregivers and healthcare professionals in home nursing, offering courses, resources, and certification programs.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <script dangerouslySetInnerHTML={{ 
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('theme');
                  if (!mode) return
                  document.documentElement.classList.add(mode);
                } catch (e) {}
              })();
            `
          }} />
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}