import { GlobalRegistrator } from "@happy-dom/global-registrator"

// URL factice exigée par lib/env.ts
process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:8000/api"

// DOM global pour les tests de composants et de hooks (@testing-library/react)
GlobalRegistrator.register()
