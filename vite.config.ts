import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      // 🔥 MERGED WORKBOX CONFIG
      workbox: {
        navigateFallback: "index.html",
        sourcemap: false,
        mode: "development",

        runtimeCaching: [
          {
            // Cache Supabase media (images, videos)
            urlPattern: ({ url }) => url.origin.includes(".supabase.co"),
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-media-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
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
