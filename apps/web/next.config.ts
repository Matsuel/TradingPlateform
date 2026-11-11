import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
    reactCompiler: true,
}

// Branche `src/i18n/request.ts` (chemin par défaut du plugin)
export default createNextIntlPlugin()(nextConfig)
