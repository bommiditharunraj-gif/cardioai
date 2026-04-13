import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        port: 3000,
        proxy: {
            '/predict': 'http://localhost:8000',
            '/process-report': 'http://localhost:8000',
            '/labs': 'http://localhost:8000',
            '/analytics': 'http://localhost:8000',
            '/settings': 'http://localhost:8000',
            '/login': 'http://localhost:8000',
            '/chat': 'http://localhost:8000',
            '/signup': 'http://localhost:8000',
        }
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    }
})
