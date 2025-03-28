/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    // Agrega otras variables de entorno que uses aquí
}

interface ImportMeta {
    readonly env: ImportMetaEnv
} 