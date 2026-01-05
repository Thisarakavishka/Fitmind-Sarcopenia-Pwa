import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

// Initialize PWA with options
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // 'register' and 'skipWaiting' are true by default, so we can remove them to fix the error
});

// Define your Next.js config
const nextConfig: NextConfig = {
  // Add any other Next.js config here if needed
};

// Export the combined config
export default withPWA(nextConfig);