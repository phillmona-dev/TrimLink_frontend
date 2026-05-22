import { LoginPage } from "@/views/auth/login-page";
import { Suspense } from "react";

export default function LoginRoutePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-transparent"><div className="animate-spin h-8 w-8 border-2 border-orange-500 rounded-full border-t-transparent" /></div>}>
      <LoginPage />
    </Suspense>
  );
}
