# 03 · Marché — User stories

> Sources : README, MVP (« recherche d’actifs et graphiques historiques ») ; maquettes `04`, `04.1`, `05` ; PR #1 et `09454d3` (rétro).

## Hors périmètre

- Persistance des cours en base (mois 10).
- Passage d’ordres depuis la fiche (maquette `06`, bonus trading).

---

## User stories

### Lot 1 — Données

#### US-01 · Consulter les actifs suivis — MUST

**En tant qu’** utilisateur, **je veux** voir une liste d’actifs avec leur cours et leur tendance **afin de** repérer rapidement ce que je pourrais tester.

Critères d’acceptation :
- [x] Liste d’actifs par défaut servie par l’API.
- [x] Tableau avec cours, variation et sparkline ; clic sur une ligne ⇒ fiche du symbole.

Tâches : T-01, T-02, T-03, T-04, T-05.

#### US-02 · Rechercher un symbole — MUST

**En tant qu’** utilisateur, **je veux** rechercher un actif par nom ou symbole **afin de** trouver un actif hors de la liste par défaut.

Critères d’acceptation :
- [x] Dialog de recherche (maquette `04.1`) alimentée par l’API.
- [x] Sélection d’un résultat ⇒ fiche du symbole.

Tâches : T-01, T-07.

### Lot 2 — Fiche

#### US-03 · Voir la fiche d’un symbole — MUST

**En tant qu’** utilisateur, **je veux** la fiche d’un actif avec son graphique historique **afin de** comprendre son comportement passé.

Critères d’acceptation :
- [x] Route `/app/market/[symbol]` avec en-tête et fil d’Ariane.
- [x] Graphique de prix sur la période.
- [x] Panneau latéral (`AppSheet`) disponible pour les actions sur le symbole.

Tâches : T-06, T-08.

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Consulter les actifs suivis | MUST | 1 | core-backend, web |
| US-02 | Rechercher un symbole | MUST | 1 | core-backend, web |
| US-03 | Voir la fiche d’un symbole | MUST | 2 | web |
