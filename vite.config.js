// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Développement local : proxy vers backend local
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },

  // Production : pas de proxy (on utilise VITE_API_URL)
  build: {
    outDir: "dist",
    sourcemap: true,
  },

  // Optionnel mais recommandé : évite les erreurs de chemin sur Render
  base: "/",
});
