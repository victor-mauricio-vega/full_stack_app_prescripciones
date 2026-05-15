"use client";

import Navbar from "@/src/components/layout/navbar";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady } = useRequireAuth("admin");

  if (!isReady)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
