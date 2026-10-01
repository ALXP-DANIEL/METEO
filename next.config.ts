import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Only this site and the portfolio's live preview may frame METEO.
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://alifdaniel.dpdns.org http://localhost:3000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
