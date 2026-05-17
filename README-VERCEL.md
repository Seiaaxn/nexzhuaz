# Deploy ke Vercel

Project ini sudah dikonfigurasi untuk Vercel:

- `vercel.json` — build command, output directory, dan rewrite SSR.
- `api/ssr.ts` — Vercel serverless function yang membungkus handler SSR
  dari TanStack Start (`dist/server/server.js`).
- `vite.config.ts` — tanpa plugin Cloudflare; output build standar.

## Langkah deploy

1. Push project ke GitHub/GitLab/Bitbucket.
2. Di Vercel, **Add New Project** → import repo.
3. Framework Preset: **Other** (biarkan auto), Vercel akan membaca `vercel.json`.
4. Klik **Deploy**.

## Local

```bash
npm install   # atau: bun install
npm run dev   # http://localhost:8080
npm run build # output: dist/client + dist/server
```

## Perubahan dari versi Cloudflare

- Dihapus: `wrangler.jsonc`, `src/server.ts`, dependency
  `@cloudflare/vite-plugin`, dan `@lovable.dev/vite-tanstack-config`.
- Ditambah: `vercel.json`, `api/ssr.ts`, dan `vite.config.ts` baru yang
  memakai plugin TanStack Start standar.
