import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default [
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
    },
    {
        ignores: ["**/build/**/*"],
    },
    {
        plugins: {
            "@stylistic": stylistic,
        },
    },
    {
        rules: {
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": "error",
            "comma-dangle": ["error", "always-multiline"],
            "@stylistic/max-len": ["error", { code: 80 }],
        },
    },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
