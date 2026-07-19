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
};

export default nextConfig;
