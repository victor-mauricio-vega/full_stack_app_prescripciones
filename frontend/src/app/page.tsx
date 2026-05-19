"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/auth.store";
import { Menu } from "../components/ui/menu";

export default function HomePage() {
  // const router = useRouter();
  // const { user } = useAuthStore();

  // useEffect(() => {
  //   if (!user) {
  //     router.replace("/");
  //     return;
  //   }
  //   const routes: Record<string, string> = {
  //     doctor: "doctor/prescriptions",
  //     patient: "patient/prescriptions",
  //     admin: "admin",
  //   };
  //   router.replace(routes[user.role]);
  // }, [user, router]);

  return (
    <div className="bg-white">
      <Menu/>
    </div>
  );
}
