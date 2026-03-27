import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  // Bundle agentspec into dist since it's not yet published to npm.
  // The yaml package (agentspec dep) uses CJS require("process") which
  // fails under ESM bundling. Provide a shim so the bundled code can
  // resolve Node built-ins at runtime.
  noExternal: ['agentspec'],
  banner: {
    js: `import { createRequire as __createRequire } from 'module'; const require = __createRequire(import.meta.url);`,
  },
});
