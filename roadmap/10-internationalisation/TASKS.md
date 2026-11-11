# 10 · Internationalisation et apparence du web (FR / EN, thème) — Tâches

> Décisions : `US.md`. Échelle de points, statuts et définition de terminé commune : [`roadmap/README.md`](../README.md). Points prévus.

## Synthèse

| Tâche | Titre | US | Couche | Priorité | Points | Dépend de | Commits |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | Installer et configurer next-intl (routing par cookie) | US-01 | web | MUST | 3 | — | — |
| T-02 | Dictionnaires FR et EN : auth, layout, navigation | US-01 | web | MUST | 5 | T-01 | — |
| T-03 | Carte « Langue et région » (sélecteur de langue) | US-01 | web | MUST | 2 | T-01, T-08 | — |
| T-04 | Formatage selon la locale active | US-02 | web | MUST | 3 | T-01 | — |
| T-05 | Traduction des écrans backtest | US-01 | web | MUST | 8 | T-02 | — |
| T-06 | Traduction du marché et du glossaire | US-01 | web | SHOULD | 5 | T-02 | — |
| T-07 | Test de cohérence des dictionnaires | US-03 | web | MUST | 2 | T-02 | — |
| T-08 | Paramètres : onglet Apparence et carte « Thème » | US-04 | web | MUST | 3 | T-01 | — |

**Total** : 31 points — MUST 26, SHOULD 5.

| Lot | Tâches | Points |
| --- | --- | --- |
| 1. Socle | T-01 → T-04, T-08 | 16 |
| 2. Écrans | T-05 → T-07 | 15 |

**Chemin critique** (16 points) : T-01 → T-02 → T-05. Le plus long : la traduction des écrans backtest (T-05) doit attendre le socle (T-02).

**Parallélisable** : T-01 dès le début ; T-02, T-04, T-08 après T-01 ; T-03 après T-08 ; T-05 et T-06 après T-02.

## Graphe des dépendances

```mermaid
flowchart LR
    T01[T-01 Installer et configurer next-intl routing par cookie]
    T02[T-02 Dictionnaires FR et EN  auth, layout, navigation]
    T03[T-03 Carte Langue et région sélecteur de langue]
    T04[T-04 Formatage selon la locale active]
    T05[T-05 Traduction des écrans backtest]
    T06[T-06 Traduction du marché et du glossaire]
    T07[T-07 Test de cohérence des dictionnaires]
    T08[T-08 Paramètres onglet Apparence et carte Thème]
    T01 --> T02
    T01 --> T03
    T01 --> T08
    T08 --> T03
    T01 --> T04
    T02 --> T05
    T02 --> T06
    T02 --> T07
```

---

## Lot 1 — Socle

### T-01 · Installer et configurer next-intl (routing par cookie)

- **US** : US-01 · **Priorité** : MUST · **Points** : 3 · **Dépend de** : — · **Commits** : —
- **Fichiers** : `apps/web/package.json`, `apps/web/src/i18n/*`, `apps/web/src/app/layout.tsx`

Critères d’acceptation :
- [ ] Une langue active lue depuis le cookie `locale`, FR par défaut.
- [ ] Aucune route préfixée par la langue (D2).

### T-02 · Dictionnaires FR et EN : auth, layout, navigation

- **US** : US-01 · **Priorité** : MUST · **Points** : 5 · **Dépend de** : T-01 · **Commits** : —
- **Fichiers** : `apps/web/messages/fr.json`, `apps/web/messages/en.json`

Critères d’acceptation :
- [ ] Les écrans auth, layout et menu lisent leurs libellés dans les dictionnaires.
- [ ] Aucun libellé FR en dur dans ces écrans.

### T-03 · Carte « Langue et région » (sélecteur de langue)

- **US** : US-01 · **Priorité** : MUST · **Points** : 2 · **Dépend de** : T-01, T-08 · **Commits** : —
- **Fichiers** : `apps/web/src/app/app/settings/page.tsx`, `apps/web/src/features/settings/*`

Critères d’acceptation :
- [ ] Carte « Langue et région » (maquette `06.2`) : description « Format d'affichage des textes, dates et nombres » et liste déroulante « Langue » (Français / English).
- [ ] Le choix FR / EN change la langue sans recharger la session.
- [ ] Le choix est conservé après rechargement (cookie `locale`).

### T-04 · Formatage selon la locale active

- **US** : US-02 · **Priorité** : MUST · **Points** : 3 · **Dépend de** : T-01 · **Commits** : —
- **Fichiers** : `apps/web/src/lib/format.ts`

Critères d’acceptation :
- [ ] `LOCALE` n'est plus une constante fixe : devise, date et durée suivent la langue.
- [ ] Une valeur de 1234,5 s'affiche `1 234,50 €` en FR et `€1,234.50` en EN.

### T-08 · Paramètres : onglet Apparence et carte « Thème »

- **US** : US-04 · **Priorité** : MUST · **Points** : 3 · **Dépend de** : T-01 · **Commits** : —
- **Fichiers** : `apps/web/src/app/app/settings/page.tsx`, `apps/web/src/features/settings/*`, `apps/web/src/components/theme-toggle.tsx`

Critères d’acceptation :
- [ ] Page Paramètres avec barre d'onglets ; seul l'onglet Apparence existe pour l'instant (maquette `06.2`).
- [ ] Carte « Thème » : trois aperçus Clair, Sombre, Système ; le thème actif est encadré.
- [ ] Le clic applique le thème via `next-themes`, sans rechargement ; `ThemeToggle` de la barre latérale reste synchronisé.
- [ ] Libellés lus dans les dictionnaires (FR et EN).
- [ ] Composant d'aperçu ajouté à `apps/web/COMPONENTS.md`.

## Lot 2 — Écrans

### T-05 · Traduction des écrans backtest

- **US** : US-01 · **Priorité** : MUST · **Points** : 8 · **Dépend de** : T-02 · **Commits** : —
- **Fichiers** : `apps/web/src/features/backtest/*`

Critères d’acceptation :
- [ ] Liste, formulaire, résultat, comparaison et messages de validation traduits.
- [ ] Aucun libellé FR visible en locale EN sur le parcours backtest.

### T-06 · Traduction du marché et du glossaire

- **US** : US-01 · **Priorité** : SHOULD · **Points** : 5 · **Dépend de** : T-02 · **Commits** : —
- **Fichiers** : `apps/web/src/features/market/*`, `apps/web/src/constants/glossary.ts`

Critères d’acceptation :
- [ ] Liste, fiche et graphique traduits.
- [ ] Chaque entrée du glossaire existe en FR et en EN (formule et unité restent identiques).

### T-07 · Test de cohérence des dictionnaires

- **US** : US-03 · **Priorité** : MUST · **Points** : 2 · **Dépend de** : T-02 · **Commits** : —
- **Fichiers** : `apps/web/messages/*.test.ts`

Critères d’acceptation :
- [ ] Le test échoue si une clé existe en FR et pas en EN, ou l'inverse.
- [ ] `bun test` le lance.
