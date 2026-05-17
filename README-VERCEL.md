# Deploy ke Vercel

Project ini sudah dikonfigurasi dan diperbaiki untuk Vercel deployment.

## 📁 Struktur Konfigurasi

- `vercel.json` — Konfigurasi Vercel untuk build command, output directory, rewrite SSR, dan headers keamanan
- `api/ssr.ts` — Vercel serverless function yang membungkus handler SSR dari TanStack Start (`dist/server/server.js`) dengan proper request/response handling
- `vite.config.ts` — Konfigurasi build standar TanStack Start tanpa plugin Cloudflare
- `.vercelignore` — File yang diexclude dari deployment untuk mengurangi ukuran build

## 🚀 Langkah Deploy

### 1. Siapkan Repository

Push project ke GitHub, GitLab, atau Bitbucket:

```bash
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy ke Vercel

**Via Dashboard Vercel:**

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **Add New Project**
3. Import repository yang sudah di-push
4. Vercel akan otomatis membaca `vercel.json`
5. Pastikan setting berikut:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/client`
   - **Install Command**: `npm install --legacy-peer-deps --no-audit --no-fund`
6. Klik **Deploy**

**Via CLI:**

```bash
npm install -g vercel
vercel
```

Ikuti instruksi yang muncul di terminal.

### 3. Environment Variables (jika diperlukan)

Jika project memerlukan environment variables, tambahkan di Vercel Dashboard:

1. Buka **Settings** > **Environment Variables**
2. Tambahkan variabel yang diperlukan (misal: Firebase config, API keys, dll)
3. Pilih environment: Production, Preview, dan Development

## 📦 Build Output

Setelah build berhasil, Vercel akan menghasilkan:

- **dist/client/** — Static assets (HTML, CSS, JS, images) yang akan di-serve langsung
- **dist/server/server.js** — SSR handler yang akan dipanggil via `api/ssr.ts`

## 🏃 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Akses di http://localhost:8080

# Build untuk production
npm run build

# Preview production build
npm run preview
```

## 🔧 Perbaikan yang Dilakukan

Proyek ini telah diperbaiki untuk Vercel deployment dengan perubahan berikut:

### 1. SSR Handler (`api/ssr.ts`)
- ✅ Proper Vercel request/response handling
- ✅ TypeScript type safety dengan `@vercel/node`
- ✅ Error handling yang lebih baik
- ✅ Support untuk streaming response

### 2. Vercel Configuration (`vercel.json`)
- ✅ Rewrite rule yang lebih akurat
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Function configuration (maxDuration: 30s, memory: 1024MB)

### 3. Package Dependencies
- ✅ Menambahkan `@vercel/node` untuk TypeScript types

### 4. Deployment Optimization (`.vercelignore`)
- ✅ Exclude unnecessary files (node_modules, .tanstack, dist, test files, dll)
- ✅ Mengurangi ukuran deployment

## ⚠️ Catatan Penting

1. **Node Version**: Project ini memerlukan Node.js >= 20. Vercel akan otomatis menggunakan Node.js 22.x sesuai konfigurasi di `api/ssr.ts`

2. **Build Time**: Build time mungkin memakan waktu 2-3 menit tergantung ukuran project

3. **Memory Limit**: SSR function dikonfigurasi dengan 1024MB memory. Jika mengalami memory error, tingkatkan di `vercel.json`

4. **Firebase Config**: Pastikan environment variables Firebase sudah diset di Vercel jika project menggunakan Firebase

5. **Routing**: Semua routing ditangani oleh TanStack Router. Pastikan `routeTree.gen.ts` sudah ter-generate sebelum deploy

## 🐛 Troubleshooting

### Build Gagal

Jika build gagal, cek:
1. Apakah semua dependencies terinstall dengan benar
2. Apakah ada error di build logs
3. Pastikan `vercel.json` tidak memiliki syntax error

### Runtime Error

Jika aplikasi error saat berjalan:
1. Cek logs di Vercel Dashboard > Functions
2. Pastikan environment variables sudah diset dengan benar
3. Cek apakah Firebase config valid

### Serverless Function Timeout

Jika mengalami timeout:
1. Tingkatkan `maxDuration` di `vercel.json`
2. Optimalkan SSR logic
3. Consider edge functions untuk routes yang lebih cepat

## 📚 Perbedaan dengan Versi Cloudflare

Project ini telah diadaptasi dari Cloudflare Workers ke Vercel Serverless Functions:

| Fitur | Cloudflare (Sebelumnya) | Vercel (Sekarang) |
|-------|------------------------|-------------------|
| Runtime | Cloudflare Workers | Node.js 22.x |
| Config | `wrangler.jsonc` | `vercel.json` |
| SSR Handler | `src/server.ts` | `api/ssr.ts` |
| Plugin | `@cloudflare/vite-plugin` | TanStack Start standar |
| Deployment | `wrangler deploy` | Vercel Dashboard/CLI |

## 📞 Bantuan

Jika mengalami masalah:
- Cek [Vercel Documentation](https://vercel.com/docs)
- Cek [TanStack Start Documentation](https://tanstack.com/start/latest)
- Lihat build logs di Vercel Dashboard
- 
