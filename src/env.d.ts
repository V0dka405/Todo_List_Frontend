/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the RESTful API, e.g. http://localhost:3333/api */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
