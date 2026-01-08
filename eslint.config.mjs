import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import vitestPlugin from "@vitest/eslint-plugin";

export default defineConfig(
  // 1. CORE CONFIG: ESLint Recommended
  eslint.configs.recommended,

  // 2. TYPESCRIPT CONFIG: TypeScript ESLint Recommended (applies to all files by default)
  ...tseslint.configs.recommended,

  // 3. TEST FILE CONFIGURATION (Applies only to files matching the glob)
  {
    files: [
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}",
      "**/__tests__/**/*.{ts,tsx,js,jsx}",
    ], // <-- Target common test file patterns

    // Use the vitest plugin
    plugins: {
      vitest: vitestPlugin, // Register the plugin under the 'vitest' namespace
    },

    // Apply the recommended Vitest rules and globals
    rules: {
      // Turn off the rule entirely for test files
      "@typescript-eslint/no-explicit-any": "off",

      // Spread all recommended Vitest rules
      ...vitestPlugin.configs.recommended.rules,

      // OPTIONAL: Add specific overrides for tests
      // For example, turn on a Vitest rule you like:
      "vitest/no-disabled-tests": "warn",
      "vitest/no-focused-tests": "error", // Highly recommended

      // OPTIONAL: Disable a general rule that is problematic in tests
      // e.g., allow functions in tests to not have explicit return types
      // '@typescript-eslint/explicit-function-return-type': 'off',
    },

    languageOptions: {
      // Automatically injects test-related globals like `describe`, `it`, `expect`
      // from the Vitest environment
      globals: {
        ...vitestPlugin.environments.env.globals,
        // Vitest might use 'vi' for mocks; if so, you should enable it
        vi: "writable",
      },
    },
  },

  // 4. PROJECT-SPECIFIC CONFIG (General overrides for all files)
  {
    rules: {
      // Add or override specific general rules here (e.g., specific TS rule overrides)
    },
  }
);
