<script setup lang="ts">
import type { GameSession } from '@couple/contracts';
import ThisOrThat from '~/components/games/ThisOrThat.vue';

const props = defineProps<{
  session: GameSession;
  layout: 'options' | 'duo' | 'stacked';
  loading?: boolean;
}>();
const emit = defineEmits<{ pick: [roundId: string, optionId: string]; finish: [] }>();

const index = ref(0);
const picks = reactive<Record<string, string>>({ ...props.session.myPicks });

/** Aksi keyboard tidak dianimasikan: diulang berkali-kali, harus instan (§4.4). */
const viaKeyboard = ref(false);

const round = computed(() => props.session.rounds[index.value] ?? null);
const total = computed(() => props.session.rounds.length);
const answered = computed(() => Object.keys(picks).length);
const isLast = computed(() => index.value === total.value - 1);
const canFinish = computed(() => answered.value === total.value);

function pick(optionId: string) {
  const r = round.value;
  if (!r) return;
  picks[r.id] = optionId;
  emit('pick', r.id, optionId);
  if (!isLast.value) setTimeout(() => { index.value += 1; }, 180);
}

function go(delta: number) {
  index.value = Math.min(total.value - 1, Math.max(0, index.value + delta));
}

function onKey(e: KeyboardEvent) {
  const r = round.value;
  if (!r) return;
  if (e.key >= '1' && e.key <= '4') {
    const opt = r.options[Number(e.key) - 1];
    if (opt) {
      viaKeyboard.value = true;
      pick(opt.id);
    }
    return;
  }
  if (e.key === 'ArrowRight') go(1);
  if (e.key === 'ArrowLeft') go(-1);
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div v-if="round">
    <div class="mb-5">
      <div class="flex items-baseline justify-between text-[13px] text-[var(--color-ink-soft)]">
        <span>Ronde {{ index + 1 }} dari {{ total }}</span>
        <span>{{ answered }} terjawab</span>
      </div>
      <div class="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--color-line)]">
        <div
          class="h-full w-full origin-left rounded-full bg-[var(--color-primary)]"
          :class="!viaKeyboard && 'bar'"
          :style="{ transform: `scaleX(${(index + 1) / total})` }"
        />
      </div>
    </div>

    <p class="text-display text-xl leading-snug">{{ round.prompt }}</p>

    <div class="mt-6">
      <ThisOrThat
        v-if="layout !== 'options'"
        :round="round" :picked="picks[round.id]" :stacked="layout === 'stacked'"
        @pick="pick"
      />

      <div v-else class="flex flex-col gap-2">
        <button
          v-for="(o, i) in round.options" :key="o.id" type="button"
          class="opt flex items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3.5 text-left text-[15px]"
          :class="picks[round.id] === o.id
            ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
            : 'border-[var(--color-line-strong)]'"
          :aria-pressed="picks[round.id] === o.id"
          @click="viaKeyboard = false; pick(o.id)"
        >
          <span class="grid size-6 shrink-0 place-items-center rounded-[var(--radius-xs)] border border-current text-[11px] opacity-60">
            {{ i + 1 }}
          </span>
          {{ o.label }}
        </button>
      </div>
    </div>

    <div class="mt-7 flex items-center gap-2">
      <BaseButton variant="ghost" icon="chevronLeft" :disabled="index === 0" @click="go(-1)">Sebelumnya</BaseButton>
      <BaseButton
        v-if="!isLast" variant="ghost" icon-right="chevronRight" class="ml-auto" @click="go(1)"
      >Berikutnya</BaseButton>
      <BaseButton
        v-else class="ml-auto" :disabled="!canFinish" :loading="loading" @click="emit('finish')"
      >Selesai</BaseButton>
    </div>

    <p v-if="!canFinish && isLast" class="mt-3 text-center text-[13px] text-[var(--color-ink-soft)]">
      Masih ada ronde yang belum dijawab.
    </p>
  </div>
</template>

<style scoped>
.bar { transition: transform 200ms var(--ease-out); }
.opt { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out); }
.opt:active { transform: scale(0.98); }
</style>
