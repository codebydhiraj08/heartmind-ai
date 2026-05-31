/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['good-symbols-open.loca.lt', '*.loca.lt', '*.lhr.life', '*.lhr.rocks'],
}

export default nextConfig
