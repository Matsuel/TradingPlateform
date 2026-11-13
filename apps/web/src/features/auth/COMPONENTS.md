# Catalogue web : `features/auth`

Écrans : `LoginForm`, `RegisterForm`. Données : `api.ts`, `hook.ts`, `schema.ts`. Même forme que `features/backtest` : react-hook-form + schéma zod + champs de `components/form`. Une erreur better-auth est relancée en `AuthError` (`code`) par `api.ts` ; `useAuthErrorMessage()` (`hook.ts`) la traduit via `auth.errors.<code>`, avec repli sur le libellé d'échec du formulaire. Gabarits d'entrée et catalogue des composants partagés : [`COMPONENTS.md`](../../../COMPONENTS.md#gabarits). Toute création, modification ou suppression d'un export catalogué met à jour son entrée dans le même diff que le code.


### LoginForm

- **Import** : `import { LoginForm } from "@/features/auth/login-form"`.
- **Rôle** : formulaire de connexion (email + mot de passe) dans une `FormSection` ; valide avec `createLoginSchema`, appelle `useLogin`, puis redirige vers `redirectTo` (prop requise, calculée par `safeRedirect` dans la page) et rafraîchit la session serveur. L’erreur better-auth s’affiche sous les champs ; lien vers `routes.register`.
- **Props** : aucune.
- **Source** : `src/features/auth/login-form.tsx`.

### RegisterForm

- **Import** : `import { RegisterForm } from "@/features/auth/register-form"`.
- **Rôle** : formulaire d'inscription (nom + email + mot de passe) dans une `FormSection` ; valide avec `createRegisterSchema`, appelle `useRegister`, puis redirige vers `routes.dashboard`. Lien vers `routes.login`.
- **Props** : aucune.
- **Source** : `src/features/auth/register-form.tsx`.

### `features/auth/api.ts`

- **Import** : `import { login } from "@/features/auth/api"`. Appeler via les hooks plutôt que directement.
- Les routes d'auth passent par le client better-auth (`signIn`/`signUp` de `lib/auth.ts`, cookies de session), pas par `apiFetch`. Une erreur better-auth est relancée en `Error(message)`.

| Export | Route (`apps/core-backend/API.md`) |
| --- | --- |
| `login` | `ALL /api/auth/{*path}` (`sign-in/email`) |
| `register` | `ALL /api/auth/{*path}` (`sign-up/email`) |

Source : `src/features/auth/api.ts`.

### `features/auth/hook.ts`

- **Import** : `import { useLogin } from "@/features/auth/hook"`.

| Export | Clé / comportement |
| --- | --- |
| `useLogin` | Mutation sans invalidation ; la redirection et `router.refresh()` sont faites par le formulaire. |
| `useRegister` | Idem. |

Source : `src/features/auth/hook.ts`.

### `features/auth/schema.ts`

- **Import** : `import { createLoginSchema, type LoginValues } from "@/features/auth/schema"`.

| Export | Rôle |
| --- | --- |
| `createLoginSchema(t)` / `LoginValues` | `t` = `useTranslations("auth.validation")` (messages dans la langue active). Connexion : le serveur juge le mot de passe. |
| `createRegisterSchema(t)` / `RegisterValues` | Même `t`. Inscription : bornes = défauts `emailAndPassword` de better-auth côté core-backend. |

Source : `src/features/auth/schema.ts`.
