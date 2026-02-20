import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    const inMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

    if (inMaintenance) {
      return [
        {
          source:
            "/((?!maintenance|api|_next/static|_next/image|favicon.ico).*)",
          destination: "/maintenance",
          permanent: false,
        },
      ];
    }

    return [];
  },
};

export default nextConfig;
