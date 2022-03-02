import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src'],
  format: ['cjs'],
  target: 'node12',
  clean: true,
  sourcemap: true,
  dts: true,
})
