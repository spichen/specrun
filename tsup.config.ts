import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  // Bundle agentspec into dist since it's not yet published to npm
  noExternal: ['agentspec'],
});
