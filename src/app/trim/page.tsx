import { PublicLayout } from "@/layouts/public-layout";
import { LandingPage } from "@/views/public/landing-page";

export default function TrimHomePage() {
  return (
    <PublicLayout>
      <LandingPage />
    </PublicLayout>
  );
}
