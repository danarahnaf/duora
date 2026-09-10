<template>
  <div class="grid min-h-dvh place-items-center px-5 py-10">
    <div class="w-full max-w-sm">
      <NuxtLink to="/" class="mb-8 flex items-center justify-center gap-2">
        <img
          src="/logo-mark.png" alt="" width="263" height="204"
          class="h-10 w-auto shrink-0"
        >
        <span class="text-display text-xl">Couple</span>
      </NuxtLink>
      <slot />
    </div>
  </div>
</template>
