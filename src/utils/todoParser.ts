export type PriorityLevel = 'high' | 'medium' | 'low' | 'none'

export interface PriorityInfo {
  level: PriorityLevel
  label: string
  colorClass: string
  bgClass: string
  dotClass: string
}

export const PRIORITIES: Record<PriorityLevel, PriorityInfo> = {
  high: {
    level: 'high',
    label: 'High',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    dotClass: 'bg-amber-400',
  },
  medium: {
    level: 'medium',
    label: 'Medium',
    colorClass: 'text-yellow-400',
    bgClass: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30',
    dotClass: 'bg-yellow-400',
  },
  low: {
    level: 'low',
    label: 'Low',
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    dotClass: 'bg-sky-400',
  },
  none: {
    level: 'none',
    label: 'Normal',
    colorClass: 'text-slate-400',
    bgClass: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
    dotClass: 'bg-slate-400',
  },
}

export type TaskColumnId = 'planned' | 'in_progress' | 'completed'

export interface TaskColumnDef {
  id: TaskColumnId
  label: string
  badgeBg: string
  badgeText: string
  dotColor: string
}

export const TASK_COLUMNS: TaskColumnDef[] = [
  {
    id: 'planned',
    label: 'Planned',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    dotColor: '#a855f7',
  },
  {
    id: 'in_progress',
    label: 'In progress',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    dotColor: '#3b82f6',
  },
  {
    id: 'completed',
    label: 'Completed',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    dotColor: '#10b981',
  },
]

export interface ParsedTodo {
  cleanTitle: string
  priority: PriorityInfo
  category: { name: string } | null
  isInProgress: boolean
  originalTitle: string
}

const PRIORITY_REGEX = /\[(🔴|ด่วนมาก|ด่วน|high)\]/i
const MEDIUM_REGEX = /\[(🟡|สำคัญ|medium)\]/i
const LOW_REGEX = /\[(🟢|ชิลๆ|low)\]/i
const IN_PROGRESS_REGEX = /\[(⚡\s*ลุยอยู่|in-progress|doing|กำลังทำ)\]/i
const TAG_REGEX = /(?:[\p{Extended_Pictographic}\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*)?\[([^\]]+)\]/u

export function parseTodoTitle(rawTitle: string): ParsedTodo {
  let text = rawTitle

  // Check in progress
  let isInProgress = false
  if (IN_PROGRESS_REGEX.test(text)) {
    isInProgress = true
    text = text.replace(IN_PROGRESS_REGEX, '').trim()
  }

  // Check priority
  let priority: PriorityInfo = PRIORITIES.none
  if (PRIORITY_REGEX.test(text)) {
    priority = PRIORITIES.high
    text = text.replace(PRIORITY_REGEX, '').trim()
  } else if (MEDIUM_REGEX.test(text)) {
    priority = PRIORITIES.medium
    text = text.replace(MEDIUM_REGEX, '').trim()
  } else if (LOW_REGEX.test(text)) {
    priority = PRIORITIES.low
    text = text.replace(LOW_REGEX, '').trim()
  }

  // Check category tag
  let category: { name: string } | null = null
  const tagMatch = text.match(TAG_REGEX)
  if (tagMatch) {
    category = {
      name: tagMatch[1].trim(),
    }
    text = text.replace(TAG_REGEX, '').trim()
  }

  // Strip any stray emojis from title for a clean, professional aesthetic
  text = text.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()

  return {
    cleanTitle: text || rawTitle,
    priority,
    category,
    isInProgress,
    originalTitle: rawTitle,
  }
}

export function getTaskColumnId(todo: { completed: boolean; title: string }): TaskColumnId {
  if (todo.completed) return 'completed'
  const parsed = parseTodoTitle(todo.title)
  if (parsed.isInProgress) return 'in_progress'
  return 'planned'
}

export function formatTodoTitle(
  cleanTitle: string,
  priority: PriorityLevel = 'none',
  category?: { name: string } | null,
  inProgress: boolean = false
): string {
  const parts: string[] = []

  if (inProgress) {
    parts.push('[In-Progress]')
  }

  if (priority === 'high') parts.push('[High]')
  else if (priority === 'medium') parts.push('[Medium]')
  else if (priority === 'low') parts.push('[Low]')

  if (category) {
    parts.push(`[${category.name}]`)
  }

  parts.push(cleanTitle.trim())
  return parts.join(' ').trim()
}
