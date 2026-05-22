import { PublicLayout } from "@/layouts/public-layout";
import { StylesLibraryPage } from "@/views/public/styles-library-page";

export const metadata = {
  title: "Haircut Styles Library - TrimLink",
  description: "Browse premium haircut styles in an immersive photo album. Choose and attach styles when booking your barber.",
};

export default function LibraryPage() {
  return (
    <PublicLayout>
      <StylesLibraryPage />
    </PublicLayout>
  );
}
