import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // This allows ngrok to tunnel into Vite
    allowedHosts: ["troy-coralliferous-marlin.ngrok-free.dev"],
    // Optional: If you want to allow ANY ngrok URL, use this instead:
    // allowedHosts: true
  },
});
