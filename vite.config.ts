import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: { options: { typeAware: true, typeCheck: true } },
  fmt: {
    ignorePatterns: [],
    singleQuote: true,
    printWidth: 120,
    sortImports: true,
    experimentalTailwindcss: {
      stylesheet: './src/styles/global.css',
      attributes: ['class', 'className'],
      functions: [],
      preserveWhitespace: true,
    },
  },
});
