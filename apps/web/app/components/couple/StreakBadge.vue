<script setup lang="ts">
/** §4.3: animasi hanya saat angka naik, bukan tiap render. */
const props = withDefaults(defineProps<{
  count: number;
  atRisk?: boolean;
  tone?: 'ink' | 'on-image';
}>(), { tone: 'ink' });

const bump = ref(false);
watch(() => props.count, (now, before) => {
  if (before !== undefined && now > before) {
    bump.value = true;
    setTimeout(() => { bump.value = false; }, 900);
  }
});

const skin = computed(() => {
  if (props.tone === 'on-image') return 'bg-black/35 text-white backdrop-blur-[6px]';
  return props.atRisk
    ? 'bg-[var(--color-danger)]/12 text-[var(--color-danger)]'
    : 'bg-[var(--color-accent)]/35 text-[var(--color-accent-ink)]';
});
</script>

<template>
  <NuxtLink
    to="/streak"
    class="pressable inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5 text-[13px] font-medium"
    :class="skin"
  >
    <BaseIcon name="flame" :size="15" :class="bump && 'counter-pulse'" />
    {{ count }} hari
    <span v-if="atRisk" class="opacity-80">· jaga hari ini</span>
  </NuxtLink>
</template>
