/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true, // gzip 압축 활성화
  poweredByHeader: false, // X-Powered-By 헤더 제거 (보안 + 약간의 오버헤드 절감)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
    ],
    minimumCacheTTL: 3600, // 이미지 캐시 1시간
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      // 보안 헤더 — 전체
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // 정적 에셋 — 1년 캐시
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // 공개 정적 파일 — 1일 캐시
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      // Service Worker — 캐시 금지 (항상 최신 버전 확인)
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // API — 캐시 금지
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
  async rewrites() {
    return [];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // CSS 인라이닝 최적화 (critical CSS 자동 추출)
    optimizeCss: true,
    // 패키지 트리 셰이킹 강화
    optimizePackageImports: ['framer-motion', '@supabase/supabase-js'],
  },
};

module.exports = nextConfig;
