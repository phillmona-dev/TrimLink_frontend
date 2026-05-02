import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";

export function BarberSettingsPage() {
  return (
    <Card>
      <h2 className="text-2xl font-black">Availability settings</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input defaultValue="09:00" type="time" />
        <Input defaultValue="18:00" type="time" />
      </div>
      <Button className="mt-5">Save availability</Button>
    </Card>
  );
}
