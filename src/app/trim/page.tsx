"use client";

import { Providers } from "@/app/providers";
import { LandingPage } from "@/views/public/landing-page";

export default function TrimHomePage() {
  return (
    <Providers>
      <LandingPage />
    </Providers>
  );
}
