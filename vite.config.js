import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { BrowserRouter } from "react-router";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
}
);