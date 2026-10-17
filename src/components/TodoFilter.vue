<script setup lang="ts">
import { ref } from 'vue'
import type { TodoFilter } from '../types/todo'

defineProps<{ counts: Record<TodoFilter, number> }>()
const filter = defineModel<TodoFilter>({ required: true })

const isOpen = ref(false)

const options: { value: TodoFilter; label: string; dotColor: string }[] = [
  { value: 'all', label: 'All tasks (ทั้งหมด)', dotColor: 'bg-slate-400' },
  { value: 'active', label: 'Active (รอทำ)', dotColor: 'bg-sky-400' },
  { value: 'completed', label: 'Completed (เสร็จแล้ว)', dotColor: 'bg-emerald-400' },
]

function select(val: TodoFilter) {
  filter.value = val
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Filter Capsule Button matching image -->
    <button
      type="button"
      class="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-white/10 bg-[#19261e] px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-slate-300 transition-all hover:border-white/20 hover:text-white active:scale-95 cursor-pointer"
      :class="filter !== 'all' ? 'border-emerald-500/50 text-[#e5f569] bg-[#1e2f25]' : ''"
      @click="isOpen = !isOpen"
    >
      <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
      <span>Filter</span>
      <span
        v-if="filter !== 'all'"
        class="size-1.5 rounded-full bg-[#e5f569]"
      />
    </button>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-30"
      @click="isOpen = false"
    />

    <!-- Filter Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute left-0 top-11 z-40 w-52 rounded-2xl border border-white/10 bg-[#16231b] p-2 shadow-2xl backdrop-blur-2xl text-xs space-y-1"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="flex w-full items-center justify-between rounded-xl px-3 py-2 font-medium transition cursor-pointer"
        :class="
          filter === opt.value
            ? 'bg-white/10 font-bold text-[#e5f569]'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        "
        @click="select(opt.value)"
      >
        <span class="flex items-center gap-2">
          <span class="size-2 rounded-full" :class="opt.dotColor" />
          <span>{{ opt.label }}</span>
        </span>
        <span class="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums font-bold">
          {{ counts[opt.value] }}
        </span>
      </button>
    </div>
  </div>
</template>
