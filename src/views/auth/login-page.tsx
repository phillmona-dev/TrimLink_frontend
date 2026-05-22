"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";
import { authService } from "@/api/authService";
import { useAuthStore } from "@/store/auth-store";
import { OAUTH2_GOOGLE_URL, OAUTH2_FACEBOOK_URL } from "@/utils/constants";
import { LogIn, MessageCircle, Eye, EyeOff } from "lucide-react";
import { AnimatedIcon } from "@/components/common/animated-icon";
import { SupportChatModal } from "@/components/widgets/support-chat-modal";
import { dashboardRoleMap } from "@/utils/constants";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect");
  const [serverMessage, setServerMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const { setSession } = useAuthStore();

  const onSubmit = async (values: FormValues) => {
    try {
      const auth = await authService.login({
        username: values.username,
        password: values.password,
      });
      
      if (!auth) {
        setServerMessage({ text: "Invalid credentials or empty response", type: 'error' });
        return;
      }

      // Save session to store (this handles localStorage correctly)
      setSession(auth);
      setServerMessage({ text: "Login successful! Redirecting...", type: 'success' });

      // Redirect based on role using the canonical role→path map
      const destination = redirectUrl || (dashboardRoleMap[auth.role as keyof typeof dashboardRoleMap] ?? "/app");
      router.push(destination);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to login";
      setServerMessage({ text: message, type: 'error' });
      setCurrentUsername(values.username);
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
          <div className="relative">
            <Input 
              id="login-password" 
              type={showPassword ? "text" : "password"} 
              className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4 pr-12" 
              placeholder="Enter password" 
              {...register("password")} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password ? <p className="mt-2 text-sm text-orange-400">{errors.password.message}</p> : null}
        </div>
        {serverMessage ? (
          <div className={`rounded-2xl p-4 text-sm border backdrop-blur-md space-y-3 ${
            serverMessage.type === 'success' 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : serverMessage.type === 'error'
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}>
            <p>{serverMessage.text}</p>
            {serverMessage.text.includes("shop has been deactivated") && (
              <Button 
                type="button"
                onClick={() => setIsSupportOpen(true)}
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/10 h-10 rounded-xl flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Contact System Admin
              </Button>
            )}
          </div>
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
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0c0c0c] px-2 text-white/30 backdrop-blur-md">Or continue with</span>
          </div>
        </div>


        <div className="grid grid-cols-2 gap-4">
          <Button 
            type="button"
            variant="outline"
            onClick={() => window.location.href = OAUTH2_GOOGLE_URL}
            className="h-12 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
            </svg>
            <span className="text-xs">Google</span>
          </Button>

          <Button 
            type="button"
            variant="outline"
            onClick={() => window.location.href = OAUTH2_FACEBOOK_URL}
            className="h-12 rounded-2xl bg-[#1877F2]/10 border-[#1877F2]/20 text-white hover:bg-[#1877F2]/20 font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-xs">Facebook</span>
          </Button>
        </div>
      </form>
      <div className="mt-8 flex items-center justify-between text-xs">
        <Link className="text-white/50 hover:text-white transition" href="/auth/forgot-password">
          Forgot password?
        </Link>
        <Link className="text-orange-400 hover:text-orange-300 transition font-medium" href="/auth/register">
          New here? Create account
        </Link>
      </div>
      <SupportChatModal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
        username={currentUsername} 
      />
    </Card>
  );
}
