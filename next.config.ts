import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  // Legacy URL: the product dashboard lives at `/app`. The marketing site is at `/`.
  // If production still opens `/` on `/dashboard`, remove a `/ → /dashboard` rule in
  // Vercel: Project → Settings → Redirects (that rule is not defined in this repo).
  async redirects() {
    return [
      { source: "/dashboard", destination: "/app", permanent: true },
      { source: "/dashboard/:path*", destination: "/app/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
