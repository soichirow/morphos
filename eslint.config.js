//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  {
    ignores: [".output/**", ".wrangler/**", "dist/**", "node_modules/**", "public/systems/**"],
  },
  ...tanstackConfig,
]
