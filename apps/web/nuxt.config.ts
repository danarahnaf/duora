import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Nuxt DevTools menambah beban nyata di dev. Nyalakan saat perlu:
  // NUXT_DEVTOOLS=true pnpm dev
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },

  modules: ['@vueuse/nuxt', '@pinia/nuxt', '@vite-pwa/nuxt'],

  // satu entry saja: main.css meng-import tokens/glass/motion supaya @theme
  // Tailwind v4 terdaftar di graf CSS yang sama.
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    // Pre-bundle sekali di awal, bukan saat route pertama kali dibuka —
    // menghilangkan jeda beberapa detik pada navigasi pertama ke tiap layar.
    optimizeDeps: {
      include: ['reka-ui', 'zod', '@vueuse/core', 'pinia'],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
        noImplicitOverride: true,
      },
    },
  },

  runtimeConfig: {
    public: {
      // kosong = pakai Nitro mock lokal
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '',
      enableDevTools: (process.env.NUXT_PUBLIC_ENABLE_DEV_TOOLS ?? 'true') === 'true',
      mockLatencyMs: Number(process.env.NUXT_PUBLIC_MOCK_LATENCY_MS ?? 450),
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          // Kedua font harus benar-benar dimuat di sini; kalau tidak, UI diam-diam
          // jatuh ke font sistem dan skala tipografinya jadi tidak seperti dirancang.
          href: 'https://fonts.googleapis.com/css2?family=Raleway:wght@500;600&family=Manrope:wght@400;500;600;700&display=swap',
        },
      ],
      meta: [{ name: 'theme-color', content: '#fdfaf6' }],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Couple — ruang untuk dua orang',
      short_name: 'Couple',
      description: 'Memory, daily question, dan rencana kencan untuk dua orang.',
      lang: 'id',
      theme_color: '#fdfaf6',
      background_color: '#fdfaf6',
      display: 'standalone',
      start_url: '/home',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        // maskable punya file sendiri: launcher memangkas ikon jadi lingkaran
        // atau squircle, jadi marknya perlu area aman lebih longgar.
        { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/offline',
      globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    },
    client: { installPrompt: true },
    devOptions: { enabled: false, suppressWarnings: true },
  },

  nitro: { compressPublicAssets: true },
});
