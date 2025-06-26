import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Only expose variables that start with VITE_
  const viteEnv = Object.keys(env)
    .filter((key) => key.startsWith('VITE_'))
    .reduce((acc, key) => {
      acc[`import.meta.env.${key}`] = JSON.stringify(env[key]);
      return acc;
    }, {} as Record<string, string>);

  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: viteEnv
  }
})

