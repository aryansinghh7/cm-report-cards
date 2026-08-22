/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" }
    ]
  },
  async headers() {
    return [
      {
        // Block search engines site-wide (link-only access, not a security measure)
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
