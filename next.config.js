/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove serverExternalPackages to avoid conflicts
  // Let Next.js handle external packages automatically
  
  async rewrites() {
    return [
      {
        source: '/api/websocket/:path*',
        destination: '/api/websocket/:path*',
      },
    ]
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig