import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrimLink",
    short_name: "TrimLink",
    description:
      "Premium barbershop booking, queue, and payment platform for Ethiopia.",
    start_url: "/",
    display: "standalone",
    background_color: "#04191c",
    theme_color: "#04191c",
    icons: [
      {
        src: "/pwa-192.svg",
        sizes: "192x192",
        type: "image/svg+xml"
      },
      {
        src: "/pwa-512.svg",
        sizes: "512x512",
        type: "image/svg+xml"
      }
    ]
  };
}
