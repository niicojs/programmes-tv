import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: { options: { typeAware: true, typeCheck: true } },
  fmt: {
    ignorePatterns: [],
    singleQuote: true,
    printWidth: 120,
    sortImports: true,
    sortTailwindcss: true,
  },
});
