import type { Todo, TodoPatch } from '../types/todo'
import { request } from './client'

/** Thin wrapper around the RESTful Todo API (one function per endpoint). */
export const todosApi = {
  /** GET /todos */
  list: () => request<Todo[]>('/todos'),

  /** POST /todos */
  create: (title: string) =>
    request<Todo>('/todos', { method: 'POST', body: JSON.stringify({ title }) }),

  /** PATCH /todos/:id */
  update: (id: number, patch: TodoPatch) =>
    request<Todo>(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

  /** DELETE /todos/:id */
  remove: (id: number) => request<void>(`/todos/${id}`, { method: 'DELETE' }),
}
