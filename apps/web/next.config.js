const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/trpc/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;