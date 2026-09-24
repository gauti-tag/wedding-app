import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp 0.35 charge libvips par dlopen. Turbopack ne le trace pas : la
  // fonction Vercel plante à l’import, y compris pour supprimer une photo.
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: {
    "/api/photos": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/sharp-linux-x64/**/*",
      "./node_modules/@img/sharp-libvips-linux-x64/**/*",
    ],
  },
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    },
    {
      source: "/manifest.webmanifest",
      headers: [{ key: "Content-Type", value: "application/manifest+json" }],
    },
  ],
};

export default nextConfig;
