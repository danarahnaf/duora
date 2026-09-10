<script setup lang="ts">
import type { Couple } from '@couple/contracts';
import PartnerAvatar from '~/components/couple/PartnerAvatar.vue';

const props = withDefaults(defineProps<{
  couple: Couple;
  tone?: 'ink' | 'on-image';
}>(), { tone: 'ink' });

const members = computed(() => props.couple.members.map(m => m.user));
</script>

<template>
  <div class="flex items-center gap-3">
    <PartnerAvatar :members="members" />
    <div class="min-w-0">
      <p
        class="truncate text-[15px] font-semibold"
        :class="tone === 'on-image' && 'text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]'"
      >{{ couple.name ?? members.map(m => m.displayName).join(' & ') }}</p>
      <p
        class="truncate text-[13px]"
        :class="tone === 'on-image' ? 'text-white/80' : 'text-[var(--color-ink-soft)]'"
      >
        {{ formatDate(couple.relationshipDate) }}
        <span v-if="!couple.isComplete"> · menunggu partner</span>
      </p>
    </div>
  </div>
</template>
