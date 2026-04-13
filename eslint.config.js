import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-unused-vars': 'error',
      'no-undef': 'error',
      // Regla custom: bloquear features de Vite que rompen en GitHub Pages (AC-2.4 PI)
      // Razón: el proyecto NO usa vite build — sirve estático directo.
      // Documentado en ADR-001.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[object.type="MetaProperty"][property.name="env"]',
          message: 'import.meta.env no está disponible en GitHub Pages. Usar js/config.js en su lugar.',
        },
        {
          selector: 'ImportDeclaration[source.value=/\\.css$/]',
          message: 'Importar CSS desde JS requiere un bundler. Usar <link> en HTML.',
        },
      ],
    },
  },
  // Archivos de configuración corren en Node.js, no en el browser
  {
    files: ['*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ['node_modules/', 'coverage/', 'playwright-report/', 'test-results/'],
  },
];
