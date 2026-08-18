import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      // El ayudante de pruebas y el punto de entrada no son código bajo prueba.
      exclude: ["src/**/*.test.ts", "src/pruebas/**", "src/servidor.ts"]
    }
  }
});
