import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // фоны открыток лежат в Vercel Blob; через оптимизатор отдаём их нужной ширины в WebP/AVIF
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/bg/**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
};

export default nextConfig;
