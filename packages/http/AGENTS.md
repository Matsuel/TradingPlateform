# @trading-plateform/http

Socle HTTP commun des services Express (`core-backend`, `market-service`) : `AppError` et ses sous-classes par statut, `RouteDescriptor` + `registerRoutes`, `errorMiddleware`. Aucune logique métier ni route. Respecte `../../AGENTS.md`.

- **Erreurs** : `AppError(code, message, statusCode, data?)`. Les sous-classes (`BadRequestError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409, `InternalError` 500, `BadGatewayError` 502) prennent un `ApiErrorCode` de `packages/contracts` et en tirent le message anglais (`API_ERROR_MESSAGES`) ; `data` est fusionné dans le corps d'erreur. Nouveau statut → nouvelle sous-classe ici, nouveau code → `packages/contracts/src/error.ts` (avec sa traduction web).
- **Corps d'erreur** : `errorMiddleware` renvoie `{ error, code, ...data }` pour une `AppError`, `500 INTERNAL_ERROR` sinon. Un service ne formate jamais lui-même une erreur.
- **Routes** : un service décrit ses routes en `RouteDescriptor[]` et les enregistre avec `registerRoutes(router, routes)`.
- Un fichier par sujet (`src/errors.ts`, `src/route.ts`, `src/error.middleware.ts`), tout réexporté par `src/index.ts`. `express` n'est utilisé que pour ses types.
- `@trading-plateform/http/testing` : `startApp(routes)` démarre un vrai serveur Express sur un port libre (routes + `errorMiddleware`) pour les tests d'intégration HTTP des apps ; jamais importé hors des dossiers `test/`.
