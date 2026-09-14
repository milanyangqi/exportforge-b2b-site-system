if (process.env.NODE_ENV === "development" && process.env.EXPORTFORGE_SELF_HOST !== "1") {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  async redirects() { return [{ source: "/:path*", has: [{type: "host", value: "www.grillbeats.com"}], destination: "https://grillbeats.com/:path*", permanent: true }]; }
};

export default nextConfig;
