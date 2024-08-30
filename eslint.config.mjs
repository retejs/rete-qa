import tseslint from 'typescript-eslint';
import configs from 'rete-cli/configs/eslint.mjs';
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['assets'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  ...configs,
  {
    rules: {
      "@typescript-eslint/naming-convention": "off",
      "global-require": "off",
      "@typescript-eslint/no-var-requires": "off",
      "no-console": "off",
      "no-empty-pattern": "off",
      "init-declarations": "off",
      "semi": "off",
      "@typescript-eslint/semi": "off",
      "newline-after-var": "off",
      "no-undefined": "off",
      "comma-dangle": "off",
      "complexity": "off",
      "max-statements": ["warn", 16],
      '@typescript-eslint/no-require-imports': 'off',
    }
  },
  {
    files: ['src/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    }
  }
)