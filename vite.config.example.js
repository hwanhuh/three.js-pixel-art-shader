import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  root: 'examples',
  base: '/three.js-pixel-art-shader/',
  plugins: [glsl()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
