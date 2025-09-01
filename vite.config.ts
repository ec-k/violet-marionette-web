import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'
import license from 'rollup-plugin-license'

// https://vite.dev/config/
export default defineConfig({
  base: '/violet-marionette-web/',
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    tsconfigPaths(),
    license({
      sourcemap: true,
      thirdParty: {
        includePrivate: true,
        multipleVersions: true,
        output: {
          file: path.join(__dirname, 'dist', 'license.txt'),
          encoding: 'utf-8',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
