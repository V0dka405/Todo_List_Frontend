<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Todo, TodoPatch } from '../types/todo'
import { getTaskColumnId, TASK_COLUMNS, type TaskColumnId } from '../utils/todoParser'
import TodoItem from './TodoItem.vue'

const props = defineProps<{
  todos: Todo[]
  busy: boolean
  isBusy: (id: number) => boolean
}>()

const emit = defineEmits<{
  toggle: [todo: Todo]
  rename: [todo: Todo, newTitle: string]
  remove: [todo: Todo]
  update: [todo: Todo, patch: TodoPatch]
}>()

// Active tab on small screens
const activeMobileCol = ref<TaskColumnId>('planned')

const columns = computed(() => {
  return TASK_COLUMNS.map((col) => {
    const items = props.todos.filter((t) => getTaskColumnId(t) === col.id)
    return {
      ...col,
      items,
      count: items.length,
    }
  })
})

function scrollToCol(colId: TaskColumnId) {
  activeMobileCol.value = colId
  const el = document.getElementById(`kanban-col-${colId}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Mobile Column Tab Navigator (3-segment switcher) -->
    <div class="grid grid-cols-3 lg:hidden gap-1 rounded-2xl bg-[#16231b] p-1 border border-white/10 text-xs font-bold">
      <button
        v-for="col in columns"
        :key="col.id"
        type="button"
        class="flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-center transition active:scale-95 cursor-pointer"
        :class="
          activeMobileCol === col.id
            ? 'bg-[#22382c] text-white ring-1 ring-emerald-500/50 shadow-sm'
            : 'text-slate-400 hover:text-white'
        "
        @click="scrollToCol(col.id)"
      >
        <span
          class="size-1.5 rounded-full shrink-0"
          :style="{ backgroundColor: col.dotColor }"
        />
        <span class="truncate text-[11px] sm:text-xs">{{ col.label }}</span>
        <span class="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] tabular-nums font-bold">
          {{ col.count }}
        </span>
      </button>
    </div>

    <!-- 3 Swimlanes Container: Responsive (Horizontal snap scroll on mobile, 3-col grid on lg) -->
    <div
      class="flex lg:grid lg:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar"
    >
      <div
        v-for="col in columns"
        :id="`kanban-col-${col.id}`"
        :key="col.id"
        class="w-[86vw] sm:w-[320px] lg:w-auto shrink-0 snap-center flex flex-col rounded-2xl sm:rounded-3xl border border-white/6 bg-[#132018]/90 p-3 sm:p-3.5 shadow-sm backdrop-blur-xl"
      >
        <!-- Column Header matching image badges -->
        <div class="flex items-center justify-between pb-2.5 sm:pb-3.5 mb-2 sm:mb-2.5 border-b border-white/5">
          <div class="inline-flex items-center gap-2">
            <!-- Pill badge matching image (Purple, Blue, Green, Orange) -->
            <span
              class="rounded-full px-3 py-0.8 text-xs font-bold shadow-xs tracking-wide"
              :class="[col.badgeBg, col.badgeText]"
            >
              {{ col.label }}
            </span>
          </div>

          <!-- Total Count Badge in Circle -->
          <span class="flex size-6 items-center justify-center rounded-full bg-[#1b2b21] text-xs font-extrabold text-slate-300 tabular-nums">
            {{ col.count }}
          </span>
        </div>

        <!-- Task Cards Stack inside Column -->
        <div class="space-y-3 min-h-[160px] flex-1">
          <TodoItem
            v-for="item in col.items"
            :key="item.id"
            :todo="item"
            :busy="isBusy(item.id)"
            @toggle="emit('toggle', item)"
            @rename="emit('rename', item, $event)"
            @remove="emit('remove', item)"
            @update="emit('update', item, $event)"
          />

          <!-- Empty State in Column -->
          <div
            v-if="col.items.length === 0"
            class="flex flex-col items-center justify-center py-10 px-2 text-center text-xs text-slate-500 rounded-2xl border border-dashed border-white/5 bg-[#101b14]/50"
          >
            <span>ไม่มีงานในช่องนี้</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
