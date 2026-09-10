<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string;
  error?: string | null;
  helper?: string;
  maxlength?: number;
  modelValue?: string | number | null;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'textarea';
  placeholder?: string;
  rows?: number;
  autocomplete?: string;
  required?: boolean;
  disabled?: boolean;
  inputmode?: 'text' | 'numeric' | 'decimal' | 'email';
}>(), {
  type: 'text',
  rows: 4,
});

const emit = defineEmits<{ 'update:modelValue': [string] }>();

const id = useId();
const describedBy = computed(() => {
  const ids: string[] = [];
  if (props.error) ids.push(`${id}-error`);
  else if (props.helper) ids.push(`${id}-helper`);
  return ids.length ? ids.join(' ') : undefined;
});

const count = computed(() => String(props.modelValue ?? '').length);

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement | HTMLTextAreaElement).value);
}
</script>

<template>
  <div class="field">
    <div v-if="label || maxlength" class="mb-1.5 flex items-baseline justify-between gap-3">
      <label v-if="label" :for="id" class="text-[13px] font-medium text-[var(--color-ink)]">
        {{ label }}
        <span v-if="required" class="text-[var(--color-primary)]">*</span>
      </label>
      <span
        v-if="maxlength"
        class="text-[11px] tabular-nums"
        :class="count > maxlength ? 'text-[var(--color-danger)]' : 'text-[var(--color-ink-soft)]'"
      >{{ count }}/{{ maxlength }}</span>
    </div>

    <textarea
      v-if="type === 'textarea'"
      :id="id" :value="modelValue ?? ''" :rows="rows" :placeholder="placeholder"
      :maxlength="maxlength" :required="required" :disabled="disabled"
      :aria-invalid="error ? true : undefined" :aria-describedby="describedBy"
      class="control w-full resize-y rounded-[var(--radius-field)] border px-3.5 py-3 text-[15px]"
      :class="error ? 'border-[var(--color-danger)]' : 'border-[var(--color-line-strong)]'"
      @input="onInput"
    />
    <input
      v-else
      :id="id" :type="type" :value="modelValue ?? ''" :placeholder="placeholder"
      :maxlength="maxlength" :required="required" :disabled="disabled"
      :autocomplete="autocomplete" :inputmode="inputmode"
      :aria-invalid="error ? true : undefined" :aria-describedby="describedBy"
      class="control tap-target h-11 w-full rounded-[var(--radius-field)] border px-3.5 text-[15px]"
      :class="error ? 'border-[var(--color-danger)]' : 'border-[var(--color-line-strong)]'"
      @input="onInput"
    >

    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-[13px] text-[var(--color-danger)]">
      {{ error }}
    </p>
    <p v-else-if="helper" :id="`${id}-helper`" class="mt-1.5 text-[13px] text-[var(--color-ink-soft)]">
      {{ helper }}
    </p>
  </div>
</template>

<style scoped>
.control {
  background: var(--color-surface-solid);
  color: var(--color-ink);
  transition: border-color var(--dur-pop) var(--ease-out), box-shadow var(--dur-pop) var(--ease-out);
}
/* Tanpa opacity: opacity 0.7 menjatuhkan kontras placeholder di bawah 4.5:1. */
.control::placeholder { color: var(--color-ink-faint); opacity: 1; }
.control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}
.control:disabled { opacity: 0.55; }
</style>
