import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { inter } from "../config/fonts";

export const metadata: Metadata = {
  title: "Sistema de Prescripciones",
  description: "Gestión de prescripciones médicas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
