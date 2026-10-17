import { ref } from 'vue'

export type ViewMode = 'list' | 'board'

const currentView = ref<ViewMode>('board')

let initialized = false

export function useTheme() {
  if (!initialized && typeof window !== 'undefined') {
    initialized = true
    const savedView = localStorage.getItem('todo_view_mode') as ViewMode | null
    if (savedView === 'list' || savedView === 'board') {
      currentView.value = savedView
    }
  }

  function setView(view: ViewMode) {
    currentView.value = view
    localStorage.setItem('todo_view_mode', view)
  }

  return {
    currentView,
    setView,
  }
}
