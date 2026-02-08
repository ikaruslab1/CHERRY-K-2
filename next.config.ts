import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^\/assets\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 1 month
        },
      },
    },
    {
      // Cache Supabase Storage (images, assets)
      urlPattern: /^https:\/\/fhuinrsvgjmrjaamznjd\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "supabase-storage",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // Cache Supabase API (GET requests)
      urlPattern: /^https:\/\/fhuinrsvgjmrjaamznjd\.supabase\.co\/rest\/v1\/.*/i,
      handler: "NetworkOnly", // Prevent stale data for API requests
      options: {
        backgroundSync: {
          name: "supabase-api-queue",
          options: {
            maxRetentionTime: 24 * 60, // Retry for failing requests for up to 24 hours (if offline)
          },
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {}, 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fhuinrsvgjmrjaamznjd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  }, 
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withPWA(withBundleAnalyzer(nextConfig));
