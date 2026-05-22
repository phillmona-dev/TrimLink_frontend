"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, type User } from "@/api/userService";
import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { 
  CheckCircle2, 
  Loader2, 
  Camera, 
  Trash2, 
  User as UserIcon, 
  Clock, 
  Scissors, 
  Plus, 
  Upload, 
  X, 
  Image as ImageIcon 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { http } from "@/api/http";
import { formatImageUrl } from "@/utils/constants";
import { barberService } from "@/api/barberService";
import { ownerService } from "@/api/ownerService";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function BarberSettingsPage() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [availabilitySuccess, setAvailabilitySuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Style reference uploads state
  const [uploadingStyleId, setUploadingStyleId] = useState<string | null>(null);

  const { session } = useAuth();
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: userService.me,
    enabled: !!session
  });

  // Fetch barber profile to obtain the profile ID
  const { data: barberProfile } = useQuery({
    queryKey: ["barber-profile-me", session?.userId],
    queryFn: () => barberService.getBarber(session!.userId),
    enabled: !!session?.userId && session.role === "BARBER"
  });

  // Fetch assignments for this barber
  const { data: assignments, refetch: refetchAssignments } = useQuery({
    queryKey: ["barber-my-services", barberProfile?.id],
    queryFn: () => ownerService.getBarberServices(barberProfile!.id),
    enabled: !!barberProfile?.id
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
    const payload = { ...data, avatarUrl: user?.avatarUrl };
    if (!payload.password) delete (payload as any).password;
    updateMutation.mutate(payload);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await http.post("/uploads/receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const serverUrl = data?.data?.url || data?.data?.imageUrl || data?.url || data?.imageUrl;

      await updateMutation.mutateAsync({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        username: user?.username || "",
        avatarUrl: serverUrl || blobUrl,
      });

      if (serverUrl && serverUrl !== blobUrl) {
        const testImg = new Image();
        testImg.onload = () => setPreviewUrl(serverUrl);
        testImg.src = serverUrl;
      }

      queryClient.invalidateQueries({ queryKey: ["me"] });
      setSuccessMsg("Profile picture updated!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error("[Avatar Upload] Error:", err);
      setPreviewUrl(null);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!user) return;
    try {
      await updateMutation.mutateAsync({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || "",
        username: user.username,
        avatarUrl: "",
      });
      setSuccessMsg("Profile picture removed!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAvailability = () => {
    setAvailabilitySuccess(true);
    setTimeout(() => setAvailabilitySuccess(false), 3000);
  };

  // Upload hairstyle for a service
  const handleUploadStyleImage = async (assignmentId: string, currentUrls: string[], file: File) => {
    setUploadingStyleId(assignmentId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await http.post("/uploads/receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const imageUrl = data?.data?.url || data?.data?.imageUrl || data?.url || data?.imageUrl;
      if (!imageUrl) throw new Error("No URL returned from server");

      const newUrls = [...currentUrls, imageUrl];
      await http.put(`/barber/services/${barberProfile!.id}/assignments/${assignmentId}/styles`, newUrls);
      refetchAssignments();
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload hairstyle reference picture.");
    } finally {
      setUploadingStyleId(null);
    }
  };

  // Delete hairstyle from a service
  const handleDeleteStyleImage = async (assignmentId: string, currentUrls: string[], urlToDelete: string) => {
    try {
      const newUrls = currentUrls.filter((url) => url !== urlToDelete);
      await http.put(`/barber/services/${barberProfile!.id}/assignments/${assignmentId}/styles`, newUrls);
      refetchAssignments();
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete hairstyle reference.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        {/* Personal Details Card */}
        <Card className="p-8">
          <h2 className="text-2xl font-black text-white">Profile Settings</h2>
          <p className="text-sm text-white/50 mt-1">Manage your professional identity and booking details.</p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/5">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-400/20 to-orange-600/10 flex items-center justify-center border border-white/10 overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Barber Avatar" className="w-full h-full object-cover" />
                ) : user?.avatarUrl ? (
                  <img src={formatImageUrl(user.avatarUrl)} alt="Barber Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-white/30" />
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-3xl bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-3">
              <h4 className="text-sm font-bold text-white">Profile Picture</h4>
              <p className="text-xs text-white/40 leading-relaxed">
                Upload a clear face photo so clients can recognize you easily when making a booking.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  size="sm"
                  className="h-10 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs"
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  Upload Photo
                </Button>
                {(previewUrl || user?.avatarUrl) && (
                  <Button 
                    onClick={handlePhotoDelete}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 px-4 rounded-xl border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:border-red-500/50 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider border-b border-white/10 pb-2">
                Personal Information
              </h3>
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
              <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider border-b border-white/10 pb-2">
                Security Credentials
              </h3>
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
                ) : "Save Changes"}
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

        {/* Availability Settings Card */}
        <Card className="p-8 h-fit">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-white">Availability Settings</h2>
          </div>
          <p className="text-sm text-white/50 mb-6">Set your standard operational start and end hours for client bookings.</p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-white/60 px-1">Start Time</label>
              <Input defaultValue="09:00" type="time" className="bg-white/5 border-white/10" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-white/60 px-1">End Time</label>
              <Input defaultValue="18:00" type="time" className="bg-white/5 border-white/10" />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <Button onClick={handleSaveAvailability} className="w-full sm:w-fit rounded-full px-8 h-12 bg-orange-500 hover:bg-orange-600 text-black font-bold transition-all">
              Save Availability
            </Button>
            {availabilitySuccess && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-500 animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="h-4 w-4" />
                Availability saved!
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Services & Hairstyle reference uploads */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">My Services & Hairstyles</h2>
            <p className="text-sm text-white/40 mt-0.5">Attach haircut style pictures to your services so clients can choose them during booking.</p>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          {!assignments || assignments.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              No services active. Go to your Services manager to link some shop services to your profile.
            </div>
          ) : (
            assignments.map((assignment: any) => (
              <ServiceAssignmentCard
                key={assignment.assignmentId}
                assignment={assignment}
                uploadingStyleId={uploadingStyleId}
                onUpload={handleUploadStyleImage}
                onDelete={handleDeleteStyleImage}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Sub-component: extracted to allow useRef at component top-level ──────────
function ServiceAssignmentCard({
  assignment,
  uploadingStyleId,
  onUpload,
  onDelete,
}: {
  assignment: any;
  uploadingStyleId: string | null;
  onUpload: (assignmentId: string, currentUrls: string[], file: File) => void;
  onDelete: (assignmentId: string, currentUrls: string[], url: string) => void;
}) {
  const uploaderRef = useRef<HTMLInputElement>(null);
  const currentUrls: string[] = assignment.styleImageUrls || [];

  return (
    <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-white">{assignment.serviceName}</h3>
          <p className="text-xs text-white/40 leading-relaxed mt-1">
            {assignment.serviceDescription || "No description provided."}
          </p>
          <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-orange-400">
            <span>{assignment.effectivePrice} ETB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span>{assignment.durationMinutes} minutes</span>
          </div>
        </div>

        <div className="shrink-0">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={uploaderRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(assignment.assignmentId, currentUrls, file);
            }}
          />
          <Button
            size="sm"
            disabled={uploadingStyleId === assignment.assignmentId}
            onClick={() => uploaderRef.current?.click()}
            className="h-10 rounded-xl bg-white text-black hover:bg-gray-200 text-xs font-bold font-sans flex items-center gap-1.5"
          >
            {uploadingStyleId === assignment.assignmentId ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Upload Style Reference
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Attached styles grid */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 px-1">
          Linked Hairstyle References ({currentUrls.length})
        </p>
        {currentUrls.length === 0 ? (
          <div className="border-2 border-dashed border-white/5 rounded-2xl p-6 text-center text-white/30 text-xs flex items-center justify-center gap-2">
            <ImageIcon className="w-4 h-4 opacity-50" />
            No style reference attached. Customers can upload their own custom reference.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentUrls.map((url: string, index: number) => (
              <div
                key={index}
                className="group relative aspect-square rounded-2xl bg-black/40 border border-white/10 overflow-hidden"
              >
                <img
                  src={formatImageUrl(url)}
                  alt={`Style reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onDelete(assignment.assignmentId, currentUrls, url)}
                    className="p-2 bg-red-500 text-white rounded-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
