<script setup lang="ts">
import { ref } from 'vue'
import { formatTodoTitle, type PriorityLevel } from '../utils/todoParser'

defineProps<{ adding: boolean }>()
const emit = defineEmits<{ submit: [title: string] }>()

const isOpen = ref(false)
const rawText = ref('')
const selectedPriority = ref<PriorityLevel>('none')
const selectedCategory = ref<{ name: string } | null>(null)
const input = ref<HTMLInputElement | null>(null)

const categories = [
  { name: 'แปลงเกษตร' },
  { name: 'เครื่องจักร' },
  { name: 'งานทั่วไป' },
  { name: 'จัดซื้อ' },
  { name: 'แผนงาน' },
]

function open() {
  isOpen.value = true
  setTimeout(() => input.value?.focus(), 100)
}

function close() {
  isOpen.value = false
}

function onSubmit() {
  const text = rawText.value.trim()
  if (!text) return

  const formatted = formatTodoTitle(
    text,
    selectedPriority.value,
    selectedCategory.value,
    false
  )
  emit('submit', formatted)
  reset()
  close()
}

function reset() {
  rawText.value = ''
  selectedPriority.value = 'none'
  selectedCategory.value = null
}

defineExpose({ open, reset })
</script>

<template>
  <div>
    <!-- Trigger Button matching image (+ New task in bright yellow) -->
    <button
      type="button"
      class="inline-flex min-h-[38px] sm:min-h-[42px] items-center justify-center gap-1.5 rounded-full bg-[#e5f569] px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold text-[#111c15] shadow-md shadow-[#e5f569]/20 transition-all duration-200 hover:bg-[#d6e659] hover:shadow-lg active:scale-95 cursor-pointer"
      @click="open"
    >
      <svg class="size-3.5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      <span>New task</span>
    </button>

    <!-- Modal / Bottom Sheet for Mobile & Desktop -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        @click.self="close"
      >
        <div
          class="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#142018] p-4.5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-2xl text-white space-y-3.5 sm:space-y-4 max-h-[92vh] overflow-y-auto"
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10">
            <div class="flex items-center gap-2">
              <span class="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-[#e5f569]/20 text-[#e5f569] font-bold text-sm">
                +
              </span>
              <div>
                <h3 class="text-sm sm:text-lg font-extrabold text-white">
                  สร้างงานใหม่ (New Task)
                </h3>
                <p class="text-[11px] sm:text-xs text-slate-400">
                  ระบุรายละเอียดและความสำคัญของงาน
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="ปิดหน้าต่าง"
              class="flex size-7 sm:size-8 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              @click="close"
            >
              <svg class="size-3.5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form Body -->
          <form class="space-y-3.5 sm:space-y-4" @submit.prevent="onSubmit">
            <!-- Title Input -->
            <div class="space-y-1.5">
              <label for="task-title-input" class="text-xs font-bold text-slate-300">
                ชื่องาน / กิจกรรม <span class="text-emerald-400">*</span>
              </label>
              <input
                id="task-title-input"
                ref="input"
                v-model="rawText"
                type="text"
                maxlength="255"
                placeholder="เช่น ตรวจแปลงข้าวโพด โซน A..."
                class="w-full rounded-2xl border border-white/10 bg-[#0d1611] px-3.5 sm:px-4 py-3 sm:py-3.5 text-[16px] sm:text-base text-white placeholder-slate-500 focus:border-[#e5f569] focus:outline-hidden"
              />
            </div>

            <!-- Priority Selector -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">ความสำคัญ (Priority)</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  class="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border py-2 sm:py-2.5 text-xs font-bold transition active:scale-95"
                  :class="
                    selectedPriority === 'high'
                      ? 'border-rose-500 bg-rose-500/25 text-rose-300 shadow-xs'
                      : 'border-white/5 bg-[#18261e] text-slate-400 hover:border-white/20'
                  "
                  @click="selectedPriority = selectedPriority === 'high' ? 'none' : 'high'"
                >
                  <span class="size-2 rounded-full bg-rose-500" />
                  <span>High</span>
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95"
                  :class="
                    selectedPriority === 'medium'
                      ? 'border-amber-500 bg-amber-500/25 text-amber-300 shadow-xs'
                      : 'border-white/5 bg-[#18261e] text-slate-400 hover:border-white/20'
                  "
                  @click="selectedPriority = selectedPriority === 'medium' ? 'none' : 'medium'"
                >
                  <span class="size-2 rounded-full bg-amber-500" />
                  <span>Medium</span>
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95"
                  :class="
                    selectedPriority === 'low'
                      ? 'border-sky-500 bg-sky-500/25 text-sky-300 shadow-xs'
                      : 'border-white/5 bg-[#18261e] text-slate-400 hover:border-white/20'
                  "
                  @click="selectedPriority = selectedPriority === 'low' ? 'none' : 'low'"
                >
                  <span class="size-2 rounded-full bg-sky-500" />
                  <span>Low</span>
                </button>
              </div>
            </div>


            <!-- Category Tags -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">แท็ก / พื้นที่</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="cat in categories"
                  :key="cat.name"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition"
                  :class="
                    selectedCategory?.name === cat.name
                      ? 'border-[#e5f569] bg-[#e5f569]/15 text-[#e5f569]'
                      : 'border-white/5 bg-[#18261e] text-slate-400 hover:text-white'
                  "
                  @click="selectedCategory = selectedCategory?.name === cat.name ? null : cat"
                >
                  <span class="text-slate-500 text-[10px]">#</span>
                  <span>{{ cat.name }}</span>
                </button>
              </div>
            </div>

            <!-- Submit Button in Bottom Row -->
            <div class="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                class="rounded-full px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                @click="close"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                :disabled="adding || !rawText.trim()"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-[#e5f569] px-6 py-2.5 text-sm font-extrabold text-[#111c15] shadow-md hover:bg-[#d6e659] active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <svg v-if="adding" class="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                </svg>
                <span>บันทึกงาน</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
