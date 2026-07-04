import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

/**
 * Guardrails for the locked @sensolus/snt-agent-kit (do not remove):
 * 1. no deep imports into the kit's dist/
 * 2. no re-declaring Snt* components in app code (use kit slots/props, or PR the kit)
 */
export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@sensolus/snt-agent-kit/*', '!@sensolus/snt-agent-kit/theme.css'],
          message: 'Deep imports into @sensolus/snt-agent-kit are forbidden. Import from the package root (theme.css is the only allowed subpath).',
        }],
      }],
      'no-restricted-syntax': ['error',
        {
          selector: 'FunctionDeclaration[id.name=/^Snt[A-Z]/]',
          message: 'Do not re-declare Snt* components in app code. Use kit slots/render props, or open a PR on the agent-kit.',
        },
        {
          selector: 'VariableDeclarator[id.name=/^Snt[A-Z]/]',
          message: 'Do not re-declare Snt* components in app code. Use kit slots/render props, or open a PR on the agent-kit.',
        },
        {
          selector: 'ClassDeclaration[id.name=/^Snt[A-Z]/]',
          message: 'Do not re-declare Snt* components in app code. Use kit slots/render props, or open a PR on the agent-kit.',
        },
      ],
    },
  },
]
