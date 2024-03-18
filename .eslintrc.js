module.exports = {
    env: {
        browser: false,
        es2021: true,
        mocha: true,
        node: true,
    },
    extends: ['standard', 'plugin:prettier/recommended', 'plugin:node/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
    },
    plugins: ['@typescript-eslint'],
    rules: {
        'node/no-unsupported-features/es-syntax': [
            'error',
            {
                version: '>=13.0.0',
                ignores: ['modules'],
            },
        ],
        'no-process-exit': ['off'],
        'node/no-unpublished-import': 'off',
    },
};
