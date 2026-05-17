import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// TanStack Start build for Vercel.
// Produces `dist/client` (static assets) and `dist/server/server.js`
// (a Web-fetch SSR handler). `api/ssr.ts` wraps the SSR handler as a
// Vercel serverless function; `vercel.json` rewrites all non-asset
// requests to it.
export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  server: {
    host: "::",
    port: 8080,
  },
});
