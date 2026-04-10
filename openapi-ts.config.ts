import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./src/docs/openapi/specs.json",
  output: "./src/api/generated",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/client-axios",
    "@tanstack/react-query",
    "zod",
  ],
});
