# 06 · Extraction de market-service — User stories

> Sources : README, « Services et responsabilités » ; commits `6a62ca8`, `5a3632d` (rétro).

## Hors périmètre

- Persistance des cours et dataset versionné (mois 10).
- Lecture des clôtures de `backtest-engine` via `market-service`.

---

## User stories

### Lot 1 — Service et proxy

#### US-01 · Servir les données de marché depuis un service dédié — MUST

**En tant qu’** architecte du projet, **je veux** un `market-service` appelé uniquement via `core-backend` **afin de** séparer les données de marché de l’API transactionnelle sans exposer de nouveau service au navigateur.

Critères d’acceptation :
- [x] `market-service` expose recherche, détail et actifs par défaut.
- [x] `/api/market/*` de `core-backend` exige une session puis relaie vers `market-service`.
- [x] En-tête `x-user-id` réécrit par le proxy, jamais repris du client.
- [x] Service injoignable ⇒ 502 `BadGatewayError`.
- [x] Parcours Marché du web inchangé ; `API.md` des deux apps à jour.

Tâches : T-01, T-02.

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Service de données de marché | MUST | 1 | market-service, core-backend |
