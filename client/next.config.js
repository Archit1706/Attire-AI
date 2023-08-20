/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
        serverComponentsExternalPackages: ["mongoose"],
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.clerk.com",
            },
            {
                protocol: "https",
                hostname: "images.clerk.dev",
            },
            {
                protocol: "https",
                hostname: "placehold.co",
            },
        ],
        typescript: {
            ignoreBuildErrors: true,
        },
        eslint: {
            ignoreDuringBuilds: true,
        },
    },
}

module.exports = nextConfig
