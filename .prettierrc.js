/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
export default {
  trailingComma: 'all',
  singleQuote: true,
  jsxSingleQuote: true,
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  importOrder: [
    '<TYPES>',
    '',
    'react',
    '<THIRD_PARTY_MODULES>',
    '',
    '^(@/shared|@/entities|@/features|@/widgets|@/pages|@/app)(.*)$',
    '^[.]',
    '',
    '.s?css$',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  tailwindFunctions: ['cva', 'cn', 'clsx'],
};
