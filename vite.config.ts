import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      workbox: {
        navigateFallback: "index.html",
        sourcemap: false,

        runtimeCaching: [
          {
            // 🚫 Prevent infinite refresh loop — never cache auth redirects
            urlPattern: ({ url }) =>
              url.origin.includes(".supabase.co") &&
              url.pathname.startsWith("/auth/v1"),
            handler: "NetworkOnly",
          },

          {
            // Cache Supabase storage images ONLY
            urlPattern: ({ url }) =>
              url.origin.includes(".supabase.co") &&
              url.pathname.startsWith("/storage/v1/object/public"),
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-media-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          {
            // Always get fresh posts (prevents stale gallery)
            urlPattern: ({ url }) =>
              url.origin.includes(".supabase.co") &&
              url.pathname.startsWith("/rest/v1"),
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },

      manifest: {
        name: "Lumina Gallery",
        short_name: "Lumina",
        description: "A modern photo and video gallery powered by Supabase.",
        start_url: "/",
        display: "standalone",
        background_color: "#09090b",
        theme_color: "#09090b",
        lang: "en",
        scope: "/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
