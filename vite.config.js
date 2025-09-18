import { resolve } from 'path';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'ThreePixelArtShader',
      fileName: 'three-pixel-art-shader',
    },
    rollupOptions: {
      external: ['three'],
      output: {
        globals: {
          three: 'THREE',
        },
      },
    },
  },
});
