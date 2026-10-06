import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/useToast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zoom Clone",
  description: "A clone of Zoom",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
