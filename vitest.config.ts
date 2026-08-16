import path from "node:path";
import ts from "typescript";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "tsx-react-jsx-for-vitest",
      enforce: "pre",
      transform(code, id) {
        if (!id.endsWith(".tsx")) {
          return null;
        }

        const output = ts.transpileModule(code, {
          compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2020,
          },
        });

        return { code: output.outputText, map: output.sourceMapText ?? null };
      },
    },
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
