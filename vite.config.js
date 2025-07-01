import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0", // Allow external connections
    port: 5173, // Default Vite port
    strictPort: false, // Use alternative port if 5173 is busy
  },
  preview: {
    host: "0.0.0.0", // For production preview
    port: 4173, // Default preview port
  },
});
