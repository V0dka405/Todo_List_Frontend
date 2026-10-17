<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { Todo, TodoPatch } from '../types/todo'
import { fireConfetti } from '../utils/confetti'
import { formatTodoTitle, parseTodoTitle } from '../utils/todoParser'

const props = defineProps<{
  todo: Todo
  busy: boolean
}>()

const emit = defineEmits<{
  toggle: []
  remove: []
  rename: [title: string]
  update: [patch: TodoPatch]
}>()

const editing = ref(false)
const draft = ref('')
const input = ref<HTMLInputElement | null>(null)

const parsed = computed(() => parseTodoTitle(props.todo.title))

// Formatted created date matching "Apr 16, 2026" or Thai short date
const dateFormatted = computed(() => {
  try {
    const d = new Date(props.todo.createdAt)
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '17 ต.ค. 2026'
  }
})

// Time / Duration badge matching "9 days ago" or "วันนี้"
const durationBadge = computed(() => {
  try {
    const d = new Date(props.todo.createdAt)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return 'วันนี้'
    if (diffDays === 1) return '1 วันที่แล้ว'
    return `${diffDays} วันที่แล้ว`
  } catch {
    return 'วันนี้'
  }
})

// Location / Category text matching "Field potato block A"
const subtextLocation = computed(() => {
  if (parsed.value.category) {
    return `Zone ${parsed.value.category.name} block`
  }
  return 'Zone A • บันทึกงานทั่วไป'
})


function startEdit() {
  if (props.busy) return
  draft.value = parsed.value.cleanTitle
  editing.value = true
  nextTick(() => {
    input.value?.focus()
    input.value?.select()
  })
}

function save() {
  if (!editing.value) return
  editing.value = false
  const title = draft.value.trim()
  if (title && title !== parsed.value.cleanTitle) {
    const newTitle = formatTodoTitle(
      title,
      parsed.value.priority.level,
      parsed.value.category,
      parsed.value.isInProgress
    )
    emit('rename', newTitle)
  }
}

function cancel() {
  editing.value = false
}

function advanceStage() {
  if (props.busy) return
  if (!props.todo.completed && !parsed.value.isInProgress) {
    // Planned -> In Progress
    const newTitle = formatTodoTitle(
      parsed.value.cleanTitle,
      parsed.value.priority.level,
      parsed.value.category,
      true
    )
    emit('update', { title: newTitle })
  } else if (!props.todo.completed && parsed.value.isInProgress) {
    // In Progress -> Completed
    fireConfetti()
    emit('update', { completed: true })
  } else if (props.todo.completed) {
    // Completed -> Re-do (Planned)
    const newTitle = formatTodoTitle(
      parsed.value.cleanTitle,
      parsed.value.priority.level,
      parsed.value.category,
      false
    )
    emit('update', { title: newTitle, completed: false })
  }
}
</script>

<template>
  <div
    class="group relative flex flex-col justify-between rounded-2xl border transition-all duration-200"
    :class="[
      todo.completed
        ? 'border-emerald-500/20 bg-[#16231b]/60 opacity-80 hover:opacity-100 dark:bg-[#142018]/60'
        : 'border-white/10 bg-[#19261e] shadow-xs hover:border-emerald-500/40 hover:bg-[#1e2f25] dark:bg-[#18261e] dark:border-white/8 dark:hover:border-emerald-500/40',
      busy ? 'opacity-40 pointer-events-none' : ''
    ]"
  >
    <!-- Card Body -->
    <div class="p-3 sm:p-4 space-y-2 sm:space-y-2.5">
      <!-- Title / Inline Edit -->
      <form v-if="editing" class="flex items-center gap-1.5" @submit.prevent="save">
        <input
          ref="input"
          v-model="draft"
          type="text"
          maxlength="255"
          class="w-full rounded-xl border border-emerald-500 bg-[#0d1611] px-3 py-1.5 text-[16px] sm:text-sm text-white focus:outline-hidden"
          @keydown.esc="cancel"
          @blur="save"
        />
        <button
          type="submit"
          class="rounded-xl bg-[#e5f569] px-2.5 py-1.5 text-xs font-bold text-[#121c16]"
        >
          บันทึก
        </button>
      </form>

      <div v-else class="space-y-1 sm:space-y-1.5">
        <h4
          tabindex="0"
          role="button"
          class="cursor-pointer text-[13px] sm:text-[15px] font-bold leading-snug break-words transition-colors hover:text-[#e5f569]"
          :class="todo.completed ? 'text-slate-400 line-through decoration-slate-500' : 'text-white'"
          @click="startEdit"
        >
          {{ parsed.cleanTitle }}
        </h4>

        <!-- Metadata Line 1: Date & Duration (Apr 16, 2026 | 9 days ago) -->
        <div class="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-medium text-slate-400">
          <span class="inline-flex items-center gap-1">
            <svg class="size-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{{ dateFormatted }}</span>
          </span>
          <span class="text-slate-600">•</span>
          <span class="inline-flex items-center gap-1">
            <svg class="size-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
            </svg>
            <span>{{ durationBadge }}</span>
          </span>
        </div>

        <!-- Metadata Line 2: Location/Category subtext -->
        <p class="text-[10px] sm:text-[11px] text-slate-400/80 truncate">
          {{ subtextLocation }}
        </p>
      </div>
    </div>

    <!-- Bottom Action Row matching image (Priority Pill + Actions) -->
    <div class="flex items-center justify-between border-t border-white/5 bg-[#142018]/50 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-b-2xl">
      <!-- Priority Pill -->
      <span
        class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
        :class="parsed.priority.bgClass"
      >
        <span class="size-1.5 rounded-full" :class="parsed.priority.dotClass" />
        <span>{{ parsed.priority.label }}</span>
      </span>

      <!-- Action Buttons Row -->
      <div class="flex items-center gap-1.5">
        <!-- Advance Stage Button -->
        <button
          type="button"
          :title="todo.completed ? 'ทำใหม่' : parsed.isInProgress ? 'ทำให้เสร็จ' : 'เริ่มทำ'"
          class="flex size-8.5 sm:size-8 items-center justify-center rounded-lg text-xs font-bold transition active:scale-90 cursor-pointer"
          :class="
            todo.completed
              ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/40'
              : parsed.isInProgress
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                : 'bg-[#22352a] text-slate-300 hover:bg-[#2b4234] hover:text-white'
          "
          @click="advanceStage"
        >
          <!-- Refresh icon for "ทำใหม่" -->
          <svg v-if="todo.completed" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M21 21v-5h-5" />
          </svg>
          <!-- Checkmark icon for "ทำให้เสร็จ" -->
          <svg v-else-if="parsed.isInProgress" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <!-- Play icon for "เริ่มทำ" -->
          <svg v-else class="size-3 text-slate-300 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 4 18 12 6 20 6 4" />
          </svg>
        </button>

        <!-- Edit Button -->
        <button
          type="button"
          aria-label="แก้ไขงาน"
          class="flex size-8.5 sm:size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#22352a] hover:text-white active:scale-90 cursor-pointer"
          @click="startEdit"
        >
          <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
        </button>

        <!-- Delete Button -->
        <button
          type="button"
          aria-label="ลบงาน"
          class="flex size-8.5 sm:size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 active:scale-90 cursor-pointer"
          @click="emit('remove')"
        >
          <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
