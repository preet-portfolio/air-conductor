module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  extends: [ 'eslint:recommended', 'plugin:@typescript-eslint/recommended' ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
