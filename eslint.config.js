const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const prettierPlugin = require('eslint-plugin-prettier')
const prettierConfig = require('eslint-config-prettier')
const unusedImportsPlugin = require('eslint-plugin-unused-imports')

module.exports = defineConfig([
    ...expoConfig,

    {
        plugins: {
            prettier: prettierPlugin,
            'unused-imports': unusedImportsPlugin,
        },

        rules: {
            'prettier/prettier': 'warn',

            // remove unused imports
            'unused-imports/no-unused-imports': 'warn',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],

            // import ordering
            'import/order': [
                'warn',
                {
                    groups: ['builtin', 'external', 'internal'],
                    'newlines-between': 'always',
                },
            ],
        },
    },

    prettierConfig,

    {
        ignores: ['dist/', 'build/', '.expo/'],
    },
])
