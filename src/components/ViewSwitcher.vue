<script setup lang="ts">
import type { ViewMode } from '../composables/useTheme'

defineProps<{
  currentView: ViewMode
}>()

const emit = defineEmits<{
  'update:view': [view: ViewMode]
}>()
</script>

<template>
  <div
    role="tablist"
    aria-label="เปลี่ยนมุมมองการทำงาน"
    class="inline-flex items-center rounded-full border border-white/10 bg-[#16231b] p-1 shadow-inner text-xs"
  >
    <!-- Kanban View Tab -->
    <button
      type="button"
      role="tab"
      :aria-selected="currentView === 'board'"
      class="inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
      :class="
        currentView === 'board'
          ? 'bg-white text-[#111c15] shadow-xs'
          : 'text-slate-400 hover:text-white'
      "
      @click="emit('update:view', 'board')"
    >
      <svg class="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <rect x="3" y="3" width="7" height="18" rx="1" />
        <rect x="14" y="3" width="7" height="10" rx="1" />
      </svg>
      <span>Kanban</span>
    </button>

    <!-- List View Tab -->
    <button
      type="button"
      role="tab"
      :aria-selected="currentView === 'list'"
      class="inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
      :class="
        currentView === 'list'
          ? 'bg-white text-[#111c15] shadow-xs'
          : 'text-slate-400 hover:text-white'
      "
      @click="emit('update:view', 'list')"
    >
      <svg class="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
      <span>List</span>
    </button>
  </div>
</template>
