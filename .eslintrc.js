module.exports = {
    env: {
        browser: false,
        es2021: true,
        mocha: true,
        node: true,
    },
    extends: [
        'standard',
        'plugin:prettier/recommended',
        'plugin:node/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
    },
    plugins: [
        '@typescript-eslint',
    ],
    rules: {},
};

