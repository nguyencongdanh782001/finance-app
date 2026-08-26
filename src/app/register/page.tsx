import AuthPageClient from "@/components/Auth/AuthPageClient";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFCFA]" />}>
      <AuthPageClient initialMode="register" />
    </Suspense>
  );
}
