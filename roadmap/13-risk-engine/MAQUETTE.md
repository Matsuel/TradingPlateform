# 13 · Risk Engine — description de la maquette

> Source : Figma `Trading` (clé `DmpvF0SdUJGCBfA6GsdErm`), section `Feature 13 · Risk Engine (33)` (node `454:12125`). Cadre `33 · Risque` (node `454:12126`, 1440 × 1141) et copie `13 · Résultat d’un backtest · à modifier (F13)` (node `497:16476`, 1440 × 1855). Lue le 2026-11-13 d'après la capture et le contexte de design du cadre ; les libellés sont recopiés tels quels (espaces et signe moins `−` U+2212 compris). Les nombres sont ceux de la maquette : un exemple, pas une règle.

## Ce que la maquette ne montre pas

La section ne contient que deux cadres : `33 · Risque` et la copie du cadre 13. Il n'y a **aucun cadre pour** l'état vide (aucun backtest choisi), le chargement, les données insuffisantes, l'erreur, ni la version sombre. Les seuls états dessinés sont le badge `Calculé` et, pour la contrainte de drawdown, les statuts `Respectée` et `Non respectée`. Tout le reste est **à trancher** (voir la fin).

## Cadre `33 · Risque`

Gabarit de page standard : sidebar (entrée `Risque` active, groupe `Analyse`), barre du haut, contenu de 1120 px de large (marges de 32 px).

- **Barre du haut** : fil d'Ariane `Analyse` › `Risque` ; pastille à droite `Données au 28/10/2026`.
- **En-tête** : titre `Risque · Portefeuille A` suivi du badge `Calculé` (contour vert, texte vert) ; sous-titre `AAPL 30 %, MSFT 30 %, IEF 30 %, GLD 10 % · 01/01/2016 – 30/06/2026 · rendements journaliers` (allocation, période, fréquence des rendements). Bouton secondaire (contour) à droite : `Choisir un backtest`.

### Quatre cartes de statistiques

Chaque carte : libellé, pastille d'unité ou de méthode à droite, valeur en grand, légende.

| Libellé | Pastille | Valeur | Légende |
| --- | --- | --- | --- |
| `Volatilité annualisée` | `1 an` | `13,2 %` | `Sur rendements journaliers` |
| `VaR 95 %` | `historique` | `−1,4 %` | `Historique, un jour · 1 jour sur 20 fait pire` |
| `CVaR 95 %` | `historique` | `−2,1 %` | `Historique, un jour · au-delà de la VaR` |
| `Concentration` | `HHI 0,28` | `30 %` | `Poids max · 3,6 actifs effectifs` |

Unités : volatilité, VaR et CVaR sont des pourcentages (VaR et CVaR négatives, perte sur un jour) ; `HHI 0,28` est un indice de Herfindahl en ratio de 0 à 1 (30 % × 3 + 10 % : 3 × 0,09 + 0,01) ; `30 %` est le poids maximal ; `3,6` est le nombre d'actifs effectifs (1 / HHI, soit 3,57 arrondi). Le calcul de ces valeurs relève du backend (règle « Responsabilités » de `AGENTS.md`), le web les affiche.

### Matrice de corrélation (carte de gauche, ligne 1)

- Titre `Matrice de corrélation` ; sous-titre `Corrélation des rendements journaliers, de −1 à +1`.
- Grille carrée, actifs dans l'ordre de l'allocation (`AAPL`, `MSFT`, `IEF`, `GLD`), libellés en colonnes (au-dessus) et en lignes (à gauche), 4 × 4 cellules arrondies (44 px de haut) contenant la valeur à deux décimales :

| | AAPL | MSFT | IEF | GLD |
| --- | --- | --- | --- | --- |
| **AAPL** | `1,00` | `0,71` | `−0,18` | `0,04` |
| **MSFT** | `0,71` | `1,00` | `−0,15` | `0,02` |
| **IEF** | `−0,18` | `−0,15` | `1,00` | `0,32` |
| **GLD** | `0,04` | `0,02` | `0,32` | `1,00` |

- Couleur de cellule (lue sur la capture) : bleu `chart-1` pour une corrélation positive, rouge `destructive` pour une négative, l'intensité croissant avec la valeur absolue ; la diagonale `1,00` est le bleu plein, texte clair. Texte sombre sur les cellules claires.
- Note sous la grille : `AAPL et MSFT bougent ensemble (0,71) : les détenir tous les deux diversifie peu. IEF et GLD amortissent les baisses actions.` Phrase de lecture rédigée, qui cite la valeur ; la maquette ne dit pas si le backend la produit ou si elle est statique.

### Contribution au risque (carte de droite, ligne 1)

- Titre `Contribution au risque` ; sous-titre `Part de la volatilité totale apportée par chaque actif`.
- Une ligne par actif : symbole à gauche, `Poids 30 % · Risque 44 %` à droite, puis une barre horizontale dont le remplissage (bleu `chart-1`) vaut la part du risque sur une piste grise :

| Actif | Texte à droite |
| --- | --- |
| `AAPL` | `Poids 30 % · Risque 44 %` |
| `MSFT` | `Poids 30 % · Risque 41 %` |
| `IEF` | `Poids 30 % · Risque 9 %` |
| `GLD` | `Poids 10 % · Risque 6 %` |

- Ligne de total, séparée par un filet : `Total des contributions` — `100 %`.
- Note : `Lecture : AAPL pèse 30 % du capital mais 44 % du risque.`

### Contrainte de drawdown (carte de gauche, ligne 2)

C'est le bloc « indicateur de drawdown » du cadre. Il ne montre pas de drawdown en carte de statistique : le drawdown n'apparaît que dans la colonne `Mesuré`.

- Titre `Contrainte de drawdown` ; sous-titre `Vérifiée sur l’historique du backtest · seule contrainte du MVP`.
- Champ `Drawdown maximal accepté`, valeur saisie `15 %`, avec le bouton principal (noir) `Vérifier` à droite.
- Tableau de quatre colonnes : `Vérification`, `Limite`, `Mesuré`, `Statut`.

| Vérification | Limite | Mesuré | Statut |
| --- | --- | --- | --- |
| `Actuelle` | `15 %` | `−21,4 %` (rouge) | badge plein rouge `Non respectée` |
| `Précédente · 25 %` | `25 %` | `−21,4 %` (couleur normale) | badge à contour vert `Respectée` |

  Lecture (non écrite dans le cadre) : `Actuelle` serait la limite saisie, `Précédente · 25 %` la vérification d'avant. Le drawdown mesuré est le même (`−21,4 %`, négatif) ; seule la limite change : `Non respectée` à 15 %, `Respectée` à 25 %, donc `Respectée` quand le drawdown mesuré ne dépasse pas la limite en valeur absolue.
- Note : `Le passé ne garantit pas l’avenir : une limite respectée sur l’historique peut être dépassée demain.`

### Expositions par actif (carte de droite, ligne 2)

- Titre `Expositions par actif` ; sous-titre `Poids, volatilité propre et part du risque`.
- Tableau : `Actif`, `Poids`, `Volatilité`, `Part du risque` (colonnes numériques alignées à droite).

| Actif | Poids | Volatilité | Part du risque |
| --- | --- | --- | --- |
| `AAPL` | `30 %` | `27,1 %` | `44 %` |
| `MSFT` | `30 %` | `25,4 %` | `41 %` |
| `IEF` | `30 %` | `6,8 %` | `9 %` |
| `GLD` | `10 %` | `14,2 %` | `6 %` |
| `Total` | `100 %` | `13,2 %` | `100 %` |

  Volatilité propre = annualisée, par actif ; la ligne `Total` reprend la volatilité du portefeuille (`13,2 %`, comme la carte de statistiques).
- Note : `Expositions par secteur et par zone : non disponibles dans cette version.`

### Disposition

Quatre cartes de 268 px côte à côte (écart 16 px), puis deux rangées de deux cartes de 548 px (écart 24 px) : matrice + contribution, puis contrainte + expositions. Les cartes d'une rangée n'ont pas la même hauteur (362 et 367 px, puis 356 et 398 px). Le cadre n'existe qu'en 1440 px : aucun cadre mobile ni tablette.

## Bouton « Risque » du cadre 13

Dans la copie `13 · Résultat d’un backtest · à modifier (F13)`, l'en-tête de la page de résultat aligne à droite quatre boutons, dans cet ordre :

| Ordre | Bouton | Variante | Taille (node) |
| --- | --- | --- | --- |
| 1 | `Dividendes et change` | secondaire (contour) | 180 × 38 (`497:16499`) |
| 2 | `Robustesse` | secondaire (contour) | 113 × 38 (`497:16500`) |
| 3 | **`Risque`** | secondaire (contour) | **80 × 38 (`497:16501`)** |
| 4 | `Relancer` | principal (noir) | 91 × 36 (`497:16502`) |

`Risque` est le nouveau bouton de la feature 13 : le premier est celui de la feature 11, le deuxième celui de la feature 12, déjà présents dans cette copie. Le bouton est une instance du bouton contour des deux autres, sans icône.

Ce que le cadre ne précise pas : la destination (vraisemblablement la page 33 pour le backtest affiché, mais aucun lien ni prototype n'est dessiné), et l'état du bouton quand le backtest n'est pas terminé. L'original `350:7214` n'a pas encore le bouton : il se met à jour au codage (README de la feature).

## À trancher (non dessiné)

> Mis à jour le 2026-11-13 : les décisions D11 à D17 du `README.md` règlent la route, l'historique (2 lignes), la pastille « Données au » (supprimée), les données insuffisantes et les backtests sans risque. Restent non dessinés : chargement, erreur, contenu du sélecteur.

- **Vide** : page `Risque` ouverte sans backtest choisi (le bouton `Choisir un backtest` existe mais son sélecteur n'est pas dessiné). Le sous-titre et les quatre cartes n'ont pas d'état sans données.
- **Chargement** : aucun squelette ni indicateur ; le badge `Calculé` suppose un état précédent (en cours de calcul, en échec) non dessiné.
- **Données insuffisantes** : historique trop court pour la volatilité à `1 an`, la VaR ou la CVaR (`—` via `<Dash />` selon `AGENTS.md`), ou un seul actif (matrice réduite à `1,00`) : rien de dessiné.
- **Contrainte** : champ vide, valeur invalide, première vérification (aucune ligne `Précédente`), plus de deux lignes dans l'historique des vérifications.
- **Cohérence** : la barre du haut affiche `Données au 28/10/2026` alors que le backtest finit au `30/06/2026` ; la maquette ne dit pas ce que désigne cette date.
