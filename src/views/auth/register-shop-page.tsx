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
import { MapPin } from "lucide-react";
import { authService } from "@/api/authService";

const schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(4, "Phone number is required"),
  shopName: z.string().min(2, "Shop name is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required"),
  shopDescription: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional()
});

type FormValues = z.infer<typeof schema>;

export function RegisterShopPage() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
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
      await authService.registerShop(values);
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
              <Input className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("firstName")} />
              {errors.firstName && <p className="mt-2 text-xs text-orange-400">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-white/70 uppercase tracking-wider">Last name</label>
              <Input className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("lastName")} />
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
              <Input type="password" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-xl h-12 px-4" {...register("password")} />
              {errors.password && <p className="mt-2 text-xs text-orange-400">{errors.password.message}</p>}
            </div>
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
      </form>
      
      <p className="mt-8 text-xs text-white/50 text-center">
        Already have a shop account? <Link className="text-orange-400 hover:text-orange-300 font-medium ml-1 transition" href="/auth/login">Sign in</Link>
      </p>
    </Card>
  );
}
