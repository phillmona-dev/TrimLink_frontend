"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, User } from "@/api/userService";
import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { session } = useAuth();
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: userService.me,
    enabled: !!session
  });

  const devicesQuery = useQuery({
    queryKey: ["devices"],
    queryFn: userService.listDevices,
    placeholderData: []
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || "",
        username: user.username,
        password: "",
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    // Only send password if it's provided
    const payload = { ...data };
    if (!payload.password) delete (payload as any).password;
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
      <Card className="p-8">
        <h2 className="text-2xl font-black">Profile settings</h2>
        <p className="text-sm text-white/50 mt-1">Manage your identity and security credentials.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider border-b border-white/10 pb-2">Personal Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-white/60 px-1">First Name</label>
                <Input 
                  placeholder="First name" 
                  {...register("firstName")}
                  error={errors.firstName?.message}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-white/60 px-1">Last Name</label>
                <Input 
                  placeholder="Last name" 
                  {...register("lastName")}
                  error={errors.lastName?.message}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-white/60 px-1">Email Address</label>
              <Input 
                placeholder="Email" 
                {...register("email")}
                error={errors.email?.message}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider border-b border-white/10 pb-2">Security Credentials</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-white/60 px-1">Username</label>
                <Input 
                  placeholder="Username" 
                  {...register("username")}
                  error={errors.username?.message}
                  className="bg-white/5 border-white/10 font-mono"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-white/60 px-1">New Password (Optional)</label>
                <Input 
                  type="password"
                  placeholder="Leave blank to keep current" 
                  {...register("password")}
                  error={errors.password?.message}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-4">
            <Button 
              type="submit" 
              className="w-full sm:w-fit rounded-full px-8 h-12 bg-orange-500 hover:bg-orange-600 text-black font-bold transition-all" 
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save changes"}
            </Button>

            {successMsg && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-500 animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="h-4 w-4" />
                {successMsg}
              </div>
            )}
          </div>
        </form>
      </Card>
      <Card>
        <h2 className="text-2xl font-black">Notification devices</h2>
        <div className="mt-5 space-y-4">
          {devicesQuery.data?.length ? (
            devicesQuery.data.map((device) => (
              <div className="rounded-3xl border border-border p-4" key={device.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{device.platform}</div>
                    <div className="text-sm text-muted-foreground">{device.deviceId ?? "Unnamed device"}</div>
                  </div>
                  <div className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
                    {device.active ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              No registered push devices yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
