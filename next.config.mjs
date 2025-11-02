const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Turbopack is default in Next.js 16; minimal config
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
