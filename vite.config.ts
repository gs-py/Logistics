import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ✅ Set the correct base path for GitHub Pages
  base: "/Logistics/",  // 🔥 Replace with your actual repo name

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
