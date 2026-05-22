import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { NetworkBanner } from "@/components/layout/network-banner";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <NetworkBanner />
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
