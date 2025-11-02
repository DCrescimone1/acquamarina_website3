const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Turbopack is default in Next.js 16; minimal config
  turbopack: {},
}

export default nextConfig
