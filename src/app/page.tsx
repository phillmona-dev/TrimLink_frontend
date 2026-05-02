import { PublicLayout } from "@/layouts/public-layout";
import { LandingPage } from "@/views/public/landing-page";

export default function HomePage() {
  return (
    <PublicLayout>
      <LandingPage />
    </PublicLayout>
  );
}
