import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Allow "any" in API route handlers (server code dealing with untyped JSON)
  {
    files: ["src/app/api/**/route.ts", "src/app/api/**/route.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
// ✅ Allow "any" in client components temporarily (launch-first)
{
  files: ["src/app/**/*.tsx", "src/app/**/*.ts"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
},

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
