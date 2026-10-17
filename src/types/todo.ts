export interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type TodoFilter = 'all' | 'active' | 'completed'

/** Fields the API allows to be changed on an existing todo. */
export type TodoPatch = Partial<Pick<Todo, 'title' | 'completed'>>
