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

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().optional(),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required")
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const { setSession } = useAuthStore();

  const onSubmit = async (values: FormValues) => {
    try {
      const auth = await authService.register(values);
      
      // Save session to store (this handles localStorage correctly)
      setSession(auth);
      
      setServerMessage({ text: "Registration successful! Redirecting...", type: 'success' });
      
      if (auth.role === "BARBER" || auth.role === "OWNER") {
        router.push("/barber/queue");
      } else {
        router.push("/app");
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to register";
      setServerMessage({ text: message, type: 'error' });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-8 rounded-[2rem] text-white">
      <h2 className="text-3xl font-normal tracking-tight text-white/90">Create account</h2>
      <p className="mt-2 text-sm text-white/50">Fast setup for customers, barbers, and shop teams.</p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider" htmlFor="register-first-name">First name</label>
            <Input id="register-first-name" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("firstName")} />
            {errors.firstName ? <p className="mt-2 text-sm text-orange-400">{errors.firstName.message}</p> : null}
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider" htmlFor="register-last-name">Last name</label>
            <Input id="register-last-name" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("lastName")} />
            {errors.lastName ? <p className="mt-2 text-sm text-orange-400">{errors.lastName.message}</p> : null}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider" htmlFor="register-username">Username</label>
          <Input id="register-username" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" placeholder="Choose a username or number" {...register("username")} />
          {errors.username ? <p className="mt-2 text-sm text-orange-400">{errors.username.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider" htmlFor="register-password">Password</label>
          <Input id="register-password" type="password" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" placeholder="Choose a secure password" {...register("password")} />
          {errors.password ? <p className="mt-2 text-sm text-orange-400">{errors.password.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider" htmlFor="register-phone">Phone number (Optional)</label>
          <Input id="register-phone" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" placeholder="+2519..." {...register("phoneNumber")} />
          {errors.phoneNumber ? <p className="mt-2 text-sm text-orange-400">{errors.phoneNumber.message}</p> : null}
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
        <Button className="w-full h-12 rounded-full bg-orange-500 text-black hover:bg-orange-600 font-semibold" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create account"}
        </Button>
      </form>
      <p className="mt-8 text-xs text-white/50 text-center">
        Already have an account? <Link className="text-orange-400 hover:text-orange-300 font-medium ml-1 transition" href="/auth/login">Sign in</Link>
      </p>
      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/50 text-center">
        Are you a Barber Shop? <Link className="text-white hover:text-orange-300 font-medium ml-1 transition" href="/auth/register/shop">Register your business</Link>
      </div>
    </Card>
  );
}
