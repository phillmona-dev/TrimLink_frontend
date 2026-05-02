import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";

export function ResetPasswordPage() {
  return (
    <Card className="mx-auto w-full max-w-xl border-white/10 bg-white/95 text-foreground dark:bg-card">
      <h2 className="text-3xl font-black">Reset credentials</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Password reset is included for future email-based recovery. For the current backend, OTP remains the primary secure flow.
      </p>
      <div className="mt-8 space-y-4">
        <Input placeholder="New password" type="password" />
        <Input placeholder="Confirm password" type="password" />
        <Button className="w-full" size="lg">Update password</Button>
      </div>
    </Card>
  );
}
