<script setup lang="ts">
import type { PublicUser } from '@couple/contracts';

withDefaults(defineProps<{
  members: PublicUser[];
  size?: 'sm' | 'md' | 'lg';
}>(), { size: 'md' });
</script>

<template>
  <div class="flex items-center -space-x-2.5">
    <BaseAvatar
      v-for="m in members" :key="m.id"
      :name="m.displayName" :src="m.avatarUrl" :size="size" ring
    />
    <span
      v-if="members.length < 2"
      class="grid size-11 place-items-center rounded-full border border-dashed border-[var(--color-line-strong)]
             text-[var(--color-ink-soft)] ring-2 ring-[var(--color-surface-solid)]"
      title="Belum ada partner"
    >
      <BaseIcon name="plus" :size="16" />
    </span>
  </div>
</template>
