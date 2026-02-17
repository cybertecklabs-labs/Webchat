/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost'],
    },
    // Enable output standalone for optimized Docker builds
    output: 'standalone',
    // Enable SWC minification
    swcMinify: true,
    // Optimize production builds
    productionBrowserSourceMaps: false,
    // Code splitting optimization
    experimental: {
        optimizeCss: true,
    },
}

module.exports = nextConfig
