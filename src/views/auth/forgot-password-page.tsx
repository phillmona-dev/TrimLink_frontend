import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";

export function ForgotPasswordPage() {
  return (
    <Card className="mx-auto w-full max-w-xl border-white/10 bg-white/95 text-foreground dark:bg-card">
      <h2 className="text-3xl font-black">Recover access</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        TrimLink uses OTP-first access. Enter your phone number and we will send you a fresh verification code.
      </p>
      <div className="mt-8 space-y-4">
        <Input placeholder="+2519..." />
        <Button className="w-full" size="lg">Send recovery OTP</Button>
      </div>
    </Card>
  );
}
