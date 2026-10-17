import { computed, onMounted, ref } from 'vue'
import { ApiError } from '../api/client'
import { todosApi } from '../api/todos'
import type { Todo, TodoFilter, TodoPatch } from '../types/todo'

/** Turns any thrown value into a short, user-facing (Thai) message. */
function describeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า API ทำงานอยู่'
    if (error.status === 404) return 'ไม่พบรายการนี้ อาจถูกลบไปแล้ว'
    if (error.status === 422) return `ข้อมูลไม่ถูกต้อง: ${error.details[0] ?? error.message}`
  }
  return fallback
}

/**
 * Todo state + actions. Every action talks to the REST API; the UI updates optimistically
 * for toggle / rename / delete and rolls back if the request fails.
 */
export function useTodos() {
  const todos = ref<Todo[]>([])
  const filter = ref<TodoFilter>('all')
  const loading = ref(false)
  const adding = ref(false)
  const error = ref<string | null>(null)
  /** ids with a request in flight, used to disable controls and prevent double submits */
  const busyIds = ref<number[]>([])

  const filteredTodos = computed(() => {
    if (filter.value === 'active') return todos.value.filter((t) => !t.completed)
    if (filter.value === 'completed') return todos.value.filter((t) => t.completed)
    return todos.value
  })
  const activeCount = computed(() => todos.value.filter((t) => !t.completed).length)
  const completedCount = computed(() => todos.value.length - activeCount.value)

  const isBusy = (id: number) => busyIds.value.includes(id)
  const markBusy = (id: number) => busyIds.value.push(id)
  const unmarkBusy = (id: number) => {
    busyIds.value = busyIds.value.filter((x) => x !== id)
  }
  const replace = (updated: Todo) => {
    const index = todos.value.findIndex((t) => t.id === updated.id)
    if (index !== -1) todos.value[index] = updated
  }

  /** Reads the list from the API (also runs on page load, so data survives a refresh). */
  async function load() {
    loading.value = true
    error.value = null
    try {
      todos.value = await todosApi.list()
    } catch (e) {
      error.value = describeError(e, 'โหลดรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      loading.value = false
    }
  }

  /** Returns true when the todo was created, so the form knows whether to clear itself. */
  async function add(title: string): Promise<boolean> {
    adding.value = true
    error.value = null
    try {
      const created = await todosApi.create(title)
      todos.value.unshift(created)
      return true
    } catch (e) {
      error.value = describeError(e, 'เพิ่มรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      return false
    } finally {
      adding.value = false
    }
  }

  async function patch(todo: Todo, changes: TodoPatch, fallback: string) {
    if (isBusy(todo.id)) return
    const snapshot = { ...todo }
    markBusy(todo.id)
    error.value = null
    replace({ ...todo, ...changes }) // optimistic
    try {
      replace(await todosApi.update(todo.id, changes))
    } catch (e) {
      replace(snapshot) // roll back
      error.value = describeError(e, fallback)
      if (e instanceof ApiError && e.status === 404) await load()
    } finally {
      unmarkBusy(todo.id)
    }
  }

  const toggle = (todo: Todo) =>
    patch(todo, { completed: !todo.completed }, 'อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')

  const rename = (todo: Todo, title: string) =>
    patch(todo, { title }, 'แก้ไขรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')

  const update = (todo: Todo, changes: TodoPatch) =>
    patch(todo, changes, 'อัปเดตรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')

  async function remove(todo: Todo) {
    if (isBusy(todo.id)) return
    const index = todos.value.findIndex((t) => t.id === todo.id)
    if (index === -1) return
    markBusy(todo.id)
    error.value = null
    todos.value.splice(index, 1) // optimistic
    try {
      await todosApi.remove(todo.id)
    } catch (e) {
      // 404 means it is already gone, which is the outcome the user wanted
      if (!(e instanceof ApiError && e.status === 404)) {
        todos.value.splice(index, 0, todo) // roll back
        error.value = describeError(e, 'ลบรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      }
    } finally {
      unmarkBusy(todo.id)
    }
  }

  /** Deletes every completed todo (one DELETE request each). */
  async function clearCompleted() {
    const done = todos.value.filter((t) => t.completed)
    await Promise.all(done.map((t) => remove(t)))
  }

  const dismissError = () => {
    error.value = null
  }

  onMounted(load)

  return {
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
    clearCompleted,
    dismissError,
  }
}
