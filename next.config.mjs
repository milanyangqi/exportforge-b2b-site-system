if (process.env.NODE_ENV === "development" && process.env.EXPORTFORGE_SELF_HOST !== "1") {
  const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  async redirects() {
    const wwwHost = [{ type: "host", value: "www.grillbeats.com" }];
    return [
      // OpenNext needs a literal destination when the root has no path segments.
      { source: "/", has: wwwHost, destination: "https://grillbeats.com/", permanent: true },
      { source: "/:path+", has: wwwHost, destination: "https://grillbeats.com/:path+", permanent: true }
    ];
  }
};

export default nextConfig;
