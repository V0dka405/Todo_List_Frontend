<script setup lang="ts">
import { computed, ref } from 'vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TodoFilter from './components/TodoFilter.vue'
import TodoForm from './components/TodoForm.vue'
import TodoItem from './components/TodoItem.vue'
import ViewSwitcher from './components/ViewSwitcher.vue'
import { useTheme } from './composables/useTheme'
import { useTodos } from './composables/useTodos'
import type { Todo } from './types/todo'
import { parseTodoTitle } from './utils/todoParser'

const {
  todos,
  filter,
  filteredTodos,
  activeCount,
  completedCount,
  loading,
  adding,
  error,
  isBusy,
  load,
  add,
  toggle,
  rename,
  update,
  remove,
  dismissError,
} = useTodos()

const { currentView, setView } = useTheme()

const form = ref<InstanceType<typeof TodoForm> | null>(null)
const searchQuery = ref('')
const counts = computed(() => ({
  all: todos.value.length,
  active: activeCount.value,
  completed: completedCount.value,
}))

// Filtered items by both tab and search query
const displayTodos = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return filteredTodos.value
  return filteredTodos.value.filter((t) => {
    const parsed = parseTodoTitle(t.title)
    return (
      t.title.toLowerCase().includes(q) ||
      parsed.cleanTitle.toLowerCase().includes(q) ||
      (parsed.category && parsed.category.name.toLowerCase().includes(q))
    )
  })
})

async function onAdd(title: string) {
  if (await add(title)) {
    searchQuery.value = ''
  }
}

function onBoardRename(todo: Todo, newTitle: string) {
  rename(todo, newTitle)
}

function openAddModal() {
  form.value?.open()
}
</script>

<template>
  <main
    class="min-h-dvh px-2.5 py-3 sm:px-6 sm:py-8 font-sans text-slate-100 transition-colors duration-500 pb-[max(5rem,env(safe-area-inset-bottom))]"
  >
    <div class="relative mx-auto w-full max-w-7xl space-y-3.5 sm:space-y-6">

      <!-- 2. Main Todoplan Glassmorphic Workstation Panel -->
      <div
        class="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/10 bg-[#121c16]/95 p-3 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-4 sm:space-y-6"
      >
        <!-- Top App Bar: Brand Logo -->
        <header class="flex items-center pb-3 sm:pb-4 border-b border-white/10">
          <!-- Logo & Brand Name -->
          <div class="flex items-center gap-2 sm:gap-2.5">
            <div class="flex size-8 sm:size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#e5f569]/20 to-emerald-500/30 border border-[#e5f569]/30 text-[#e5f569] shadow-inner">
              <svg class="size-4 sm:size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <span class="text-base sm:text-lg font-black tracking-tight text-white">
              Todoplan
            </span>
          </div>
        </header>

        <!-- Tasks Action Toolbar: Row 1 (Heading + Yellow "+ New task" Button) -->
        <div class="flex items-center justify-between gap-2.5">
          <div>
            <h1 class="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Tasks
            </h1>
            <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              จัดการรายการทั้งหมด {{ todos.length }} งาน • เสร็จแล้ว {{ completedCount }} งาน
            </p>
          </div>

          <!-- + New task Button (Hero Action) -->
          <TodoForm ref="form" :adding="adding" @submit="onAdd" />
        </div>

        <!-- Tasks Action Toolbar: Row 2 (Search, Filter Capsule, View Switcher) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
          <!-- Search Capsule Input -->
          <div class="relative flex-1">
            <div class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tasks..."
              class="w-full rounded-full border border-white/10 bg-[#19261e] py-2 pr-8 pl-9 text-[16px] sm:text-sm text-white placeholder-slate-400 focus:border-emerald-500 focus:bg-[#1e2f25] focus:outline-hidden"
            />
            <button
              v-if="searchQuery"
              type="button"
              aria-label="ล้างการค้นหา"
              class="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-white"
              @click="searchQuery = ''"
            >
              <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Filter & View Switcher Row on Mobile / Right Group on Desktop -->
          <div class="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <TodoFilter v-model="filter" :counts="counts" />
            <ViewSwitcher :current-view="currentView" @update:view="setView" />
          </div>
        </div>

        <!-- Error Banner -->
        <div
          v-if="error"
          role="alert"
          class="flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs sm:text-sm text-red-300"
        >
          <p class="flex-1">{{ error }}</p>
          <button
            v-if="todos.length === 0"
            type="button"
            class="text-xs font-bold underline hover:text-white"
            @click="load"
          >
            ลองใหม่
          </button>
          <button
            type="button"
            aria-label="ปิดข้อความ"
            class="flex size-7 items-center justify-center rounded-lg hover:bg-white/10"
            @click="dismissError"
          >
            <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4" aria-busy="true">
          <div
            v-for="n in 3"
            :key="n"
            class="rounded-3xl border border-white/5 bg-[#142018]/60 p-4 space-y-3 animate-pulse"
          >
            <div class="h-6 w-24 rounded-full bg-white/10" />
            <div class="h-28 rounded-2xl bg-white/5" />
            <div class="h-28 rounded-2xl bg-white/5" />
          </div>
        </div>

        <!-- 3. MAIN WORKSPACE CONTENT: KANBAN VIEW OR LIST VIEW -->
        <div v-else>
          <!-- A. KANBAN VIEW (3 Swimlanes: Planned, In progress, Completed) -->
          <KanbanBoard
            v-if="currentView === 'board'"
            :todos="displayTodos"
            :busy="loading"
            :is-busy="isBusy"
            @toggle="toggle"
            @rename="onBoardRename"
            @update="update"
            @remove="remove"
          />

          <!-- B. LIST VIEW (Clean Responsive Stream for quick scanning) -->
          <div
            v-else-if="currentView === 'list'"
            class="space-y-3"
          >
            <div v-if="displayTodos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <TodoItem
                v-for="todo in displayTodos"
                :key="todo.id"
                :todo="todo"
                :busy="isBusy(todo.id)"
                @toggle="toggle(todo)"
                @rename="rename(todo, $event)"
                @update="update(todo, $event)"
                @remove="remove(todo)"
              />
            </div>

            <!-- Empty List State -->
            <div
              v-else
              class="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-white/10 bg-[#132018]/40"
            >
              <div class="flex size-14 items-center justify-center rounded-full bg-[#1b2b21] text-emerald-400 mb-3 border border-emerald-500/20">
                <svg class="size-6 text-emerald-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
                  <path d="m9 14 2 2 4-4" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-white">
                ไม่พบรายการภารกิจ
              </h3>
              <p class="text-xs text-slate-400 mt-1 max-w-xs">
                คุณสามารถกดปุ่ม "+ New task" เพื่อเพิ่มภารกิจใหม่ได้เลย
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Floating Action Button (FAB) - เหมาะกับมือถือทุกรุ่น เอื้อมนิ้วโป้งกดง่าย -->
    <button
      type="button"
      aria-label="เพิ่มงานใหม่"
      class="sm:hidden fixed right-4 bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))] z-40 flex size-14 items-center justify-center rounded-full bg-[#e5f569] text-[#111c15] font-black text-2xl shadow-xl shadow-black/60 transition active:scale-90 cursor-pointer"
      @click="openAddModal"
    >
      +
    </button>
  </main>
</template>
