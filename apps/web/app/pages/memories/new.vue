<script setup lang="ts">
import MemoryUploadSheet from '~/components/memory/MemoryUploadSheet.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Memori baru' });
</script>

<template>
  <div>
    <NavAppHeader title="Memori baru" back="/memories" />
    <div class="px-4 py-4">
      <MemoryUploadSheet @done="navigateTo('/memories')" />
    </div>
  </div>
</template>
