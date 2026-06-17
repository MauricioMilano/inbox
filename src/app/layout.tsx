import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milano Inbox",
  description: "Sistema de caixa de entrada de contatos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
