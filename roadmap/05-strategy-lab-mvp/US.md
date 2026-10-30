# 05 · Strategy Lab MVP — User stories

> Sources : README, « Roadmap annuelle », mois 2, et « Strategy Lab » ; maquettes `11`, `12`, `13`, `06.1` ; plan d’époque `2026-10-25-backtest-mvp.md` ; commits du 2026-10-24 au 2026-10-28 (rétro).

## Hors périmètre

- Total des frais, positions finales, comparaison DCA / investissement unique, hypothèses affichées : feature 07.
- Poids par actif et rebalancement : feature 08.

---

## User stories

### Lot 1 — Configuration

#### US-01 · Configurer et lancer un backtest — MUST

**En tant qu’** utilisateur, **je veux** choisir des symboles, une période, un mode (DCA ou investissement unique), un montant et des frais, puis lancer la simulation **afin de** tester une règle d’investissement simple.

Critères d’acceptation :
- [x] Formulaire « Nouveau backtest » par sections, validé par zod côté web et côté API.
- [x] Sélection de plusieurs symboles via la recherche.
- [x] `POST /api/backtests` crée le backtest et sa première exécution, réponse 201.

Tâches : T-01, T-02, T-06, T-07, T-08.

#### US-06 · Lancer un test rapide depuis une fiche — SHOULD

**En tant qu’** utilisateur, **je veux** tester un symbole directement depuis sa fiche **afin de** ne pas ressaisir le formulaire complet.

Critères d’acceptation :
- [x] Formulaire réduit dans le panneau latéral de la fiche (maquette `06.1`).

Tâches : T-11.

### Lot 2 — Exécution asynchrone

#### US-02 · Suivre une exécution asynchrone — MUST

**En tant qu’** utilisateur, **je veux** voir mon backtest passer de « En attente » à « En cours » puis « Terminé » ou « Échec » **afin de** savoir quand lire le résultat.

Critères d’acceptation :
- [x] `backtest.requested` publié à la création ; `backtest.started`, `backtest.completed`, `backtest.failed` consommés par `core-backend`.
- [x] Transitions gardées : un événement rejoué ou tardif ne modifie rien.
- [x] Un message invalide est loggué et ignoré, sans crash.
- [x] Échec (données indisponibles, rien investi) visible avec son message.

Tâches : T-03, T-04, T-05, T-09, T-10.

#### US-03 · Lire le résultat d’un backtest — MUST

**En tant qu’** utilisateur, **je veux** la courbe de valeur, les transactions simulées et les métriques **afin de** juger la stratégie.

Critères d’acceptation :
- [x] Moteur pur et testé : versements planifiés, achat à la clôture, frais par achat, cours manquant reporté.
- [x] Valeur finale, total investi, rendement total, nombre d’ordres, max drawdown et sa date.
- [x] Courbe de valeur et total investi ; tableau des achats.

Tâches : T-09, T-10.

#### US-04 · Relancer et consulter l’historique — MUST

**En tant qu’** utilisateur, **je veux** relancer un backtest et retrouver chaque exécution **afin de** comparer des lancements sans perdre les précédents.

Critères d’acceptation :
- [x] Chaque relance crée une exécution numérotée (`attempt`) avec son propre statut et résultat.
- [x] Relance pendant une exécution active ⇒ 409 `ConflictError`.
- [x] Historique des exécutions sur la page de détail.

Tâches : T-03, T-10.

### Lot 3 — Liste

#### US-05 · Parcourir mes backtests — MUST

**En tant qu’** utilisateur, **je veux** la liste de mes backtests avec des compteurs, des filtres par statut et une pagination **afin de** retrouver un backtest.

Critères d’acceptation :
- [x] Cartes : total, en cours, terminés, échoués (taux en fraction côté API).
- [x] Filtre par statut de la dernière exécution, pagination côté API.
- [x] États de chargement et d’erreur uniformes.

Tâches : T-08, T-12, T-13.

#### US-07 · Écrire les conventions d’architecture — SHOULD

**En tant que** développeur (ou agent), **je veux** des règles écrites par dossier **afin que** chaque nouvelle feature suive la même architecture.

Critères d’acceptation :
- [x] `AGENTS.md` à la racine et dans chaque app/package, `CLAUDE.md` qui y renvoie.

Tâches : T-14.

---

## Récapitulatif

| US | Titre | Priorité | Lot | Couches |
| --- | --- | --- | --- | --- |
| US-01 | Configurer et lancer | MUST | 1 | core-backend, web |
| US-02 | Exécution asynchrone | MUST | 2 | contracts, kafka, engine, core-backend |
| US-03 | Lire le résultat | MUST | 2 | engine, core-backend, web |
| US-04 | Relancer, historique | MUST | 2 | core-backend, web |
| US-05 | Parcourir mes backtests | MUST | 3 | core-backend, web |
| US-06 | Test rapide | SHOULD | 1 | web |
| US-07 | Conventions d’architecture | SHOULD | 3 | docs |
