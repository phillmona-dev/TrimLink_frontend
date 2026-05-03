"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";
import { authService } from "@/api/authService";
import { useAuthStore } from "@/store/auth-store";
import { LogIn } from "lucide-react";
import { AnimatedIcon } from "@/components/common/animated-icon";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const { setSession } = useAuthStore();

  const onSubmit = async (values: FormValues) => {
    try {
      const auth = await authService.login({
        username: values.username,
        password: values.password,
      });
      
      // Save session to store (this handles localStorage correctly)
      setSession(auth);
      
      setServerMessage({ text: "Login successful! Redirecting...", type: 'success' });
      
      // Redirect based on role
      if (auth.role === "STAFF" || auth.role === "OWNER") {
        router.push("/staffs/queue");
      } else {
        router.push("/app");
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to login";
      setServerMessage({ text: message, type: 'error' });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-8 rounded-[2rem] text-white">
      <h2 className="text-3xl font-normal tracking-tight text-white/90">Welcome back</h2>
      <p className="mt-2 text-sm text-white/50">Sign in with your username and password.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider" htmlFor="login-username">Username</label>
          <Input id="login-username" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" placeholder="Enter username or number" {...register("username")} />
          {errors.username ? <p className="mt-2 text-sm text-orange-400">{errors.username.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider" htmlFor="login-password">Password</label>
          <Input id="login-password" type="password" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" placeholder="Enter password" {...register("password")} />
          {errors.password ? <p className="mt-2 text-sm text-orange-400">{errors.password.message}</p> : null}
        </div>
        {serverMessage ? (
          <p className={`rounded-2xl p-4 text-sm border backdrop-blur-md ${
            serverMessage.type === 'success' 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : serverMessage.type === 'error'
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}>
            {serverMessage.text}
          </p>
        ) : null}
        <Button className="w-full h-12 rounded-full bg-orange-500 text-black hover:bg-orange-600 font-bold flex items-center justify-center gap-2" disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            "Signing in..."
          ) : (
            <>
              Sign in
              <AnimatedIcon icon={LogIn} size={18} animate="scale" />
            </>
          )}
        </Button>
      </form>
      <div className="mt-8 flex items-center justify-between text-xs">
        <Link className="text-white/50 hover:text-white transition" href="/auth/forgot-password">
          Forgot password?
        </Link>
        <Link className="text-orange-400 hover:text-orange-300 transition font-medium" href="/auth/register">
          New here? Create account
        </Link>
      </div>
    </Card>
  );
}
