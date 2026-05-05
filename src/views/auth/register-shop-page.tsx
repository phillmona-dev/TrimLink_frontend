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
import { MapPin, Eye, EyeOff } from "lucide-react";
import { authService } from "@/api/authService";
import { OAUTH2_GOOGLE_URL, OAUTH2_FACEBOOK_URL } from "@/utils/constants";

const schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  phoneNumber: z.string().min(4, "Phone number is required"),
  shopName: z.string().min(2, "Shop name is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required"),
  shopDescription: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export function RegisterShopPage() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude);
          setValue("longitude", position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please ensure location services are enabled.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const { confirmPassword, ...registerData } = values;
      await authService.registerShop(registerData as any);
      setIsSuccess(true);
      setServerMessage({ 
        text: "Registration submitted successfully! Your account is pending admin approval.", 
        type: 'info' 
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to register shop";
      setServerMessage({ text: message, type: 'error' });
    }
  };

  if (isSuccess) {
    return (
      <Card className="mx-auto w-full max-w-md border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-8 rounded-[2rem] text-white text-center">
        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-normal tracking-tight text-white/90 mb-4">Registration Submitted</h2>
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-sm mb-8">
          {serverMessage?.text}
        </div>
        <Link href="/auth/login">
          <Button className="w-full h-12 rounded-full bg-orange-500 text-black hover:bg-orange-600 font-semibold">
            Return to Login
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-lg border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-8 rounded-[2rem] text-white">
      <h2 className="text-3xl font-normal tracking-tight text-white/90">Register Shop</h2>
      <p className="mt-2 text-sm text-white/50">Submit your barber shop details for admin approval.</p>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider border-b border-white/10 pb-2">Owner Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">First name</label>
              <Input placeholder="e.g. John" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("firstName")} />
              {errors.firstName && <p className="mt-2 text-xs text-orange-400">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">Last name</label>
              <Input placeholder="e.g. Doe" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("lastName")} />
              {errors.lastName && <p className="mt-2 text-xs text-orange-400">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">Username</label>
              <Input className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("username")} />
              {errors.username && <p className="mt-2 text-xs text-orange-400">{errors.username.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">Password</label>
              <Input 
                type={showPassword ? "text" : "password"} 
                className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" 
                {...register("password")} 
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              {errors.password && <p className="mt-2 text-xs text-orange-400">{errors.password.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">Confirm Password</label>
            <Input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Repeat password" 
              className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" 
              {...register("confirmPassword")} 
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            {errors.confirmPassword && <p className="mt-2 text-xs text-orange-400">{errors.confirmPassword.message}</p>}
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">Phone number</label>
            <Input className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("phoneNumber")} />
            {errors.phoneNumber && <p className="mt-2 text-xs text-orange-400">{errors.phoneNumber.message}</p>}
          </div>
        </div>

        {/* Shop Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider border-b border-white/10 pb-2">Shop Details</h3>
          <div>
            <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">Shop Name</label>
            <Input className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("shopName")} />
            {errors.shopName && <p className="mt-2 text-xs text-orange-400">{errors.shopName.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">City</label>
              <Input className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("city")} />
              {errors.city && <p className="mt-2 text-xs text-orange-400">{errors.city.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">Address</label>
              <Input className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("address")} />
              {errors.address && <p className="mt-2 text-xs text-orange-400">{errors.address.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">Description (Optional)</label>
            <Input className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("shopDescription")} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-medium text-white/70 uppercase tracking-wider">Exact Location (Optional)</label>
              <Button type="button" variant="outline" size="sm" onClick={handleGetLocation} className="text-[10px] h-7 px-3 bg-white/5 border-white/10 rounded-full hover:bg-white/10">
                <MapPin className="w-3 h-3 mr-1" /> Get Current Location
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Input type="number" step="any" placeholder="Latitude" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("latitude")} />
                {errors.latitude && <p className="mt-2 text-xs text-orange-400">{errors.latitude.message}</p>}
              </div>
              <div>
                <Input type="number" step="any" placeholder="Longitude" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("longitude")} />
                {errors.longitude && <p className="mt-2 text-xs text-orange-400">{errors.longitude.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {serverMessage && !isSuccess && (
          <p className={`rounded-2xl p-4 text-sm border backdrop-blur-md ${
            serverMessage.type === 'success' 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : serverMessage.type === 'error'
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}>
            {serverMessage.text}
          </p>
        )}
        
        <Button className="w-full h-12 rounded-full bg-orange-500 text-black hover:bg-orange-600 font-semibold mt-4" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting..." : "Submit Registration"}
        </Button>

        <div className="relative my-8">
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
            onClick={() => {
              localStorage.setItem("pending_shop_registration", "true");
              window.location.href = OAUTH2_GOOGLE_URL;
            }}
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
            onClick={() => {
              localStorage.setItem("pending_shop_registration", "true");
              window.location.href = OAUTH2_FACEBOOK_URL;
            }}
            className="h-12 rounded-2xl bg-[#1877F2]/10 border-[#1877F2]/20 text-white hover:bg-[#1877F2]/20 font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-xs">Facebook</span>
          </Button>
        </div>
      </form>
      
      <p className="mt-8 text-xs text-white/50 text-center">
        Already have a shop account? <Link className="text-orange-400 hover:text-orange-300 font-medium ml-1 transition" href="/auth/login">Sign in</Link>
      </p>
    </Card>
  );
}
