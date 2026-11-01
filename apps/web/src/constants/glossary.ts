/**
 * Explication d'une donnée affichée, ouverte par `InfoHint` (feature 09, D3).
 * `source` cite le fichier et le symbole qui calculent la donnée : relire le texte contre ce code quand le calcul change.
 */
export type GlossaryEntry = {
    title: string
    purpose: string // « À quoi ça sert »
    computation: string // « Comment c’est calculé », en phrases
    formula?: string // texte Unicode, affiché en font-mono (D5)
    unit: string
    readingTip?: string // « Comment le lire »
    source: string // `<chemin depuis la racine du dépôt> · <symbole>`
}

const ENGINE = "apps/backtest-engine/engine/backtest.engine.ts"
const ENGINE_UTILS = "apps/backtest-engine/engine/backtest.utils.ts"
const BACKTEST_SERVICE = "apps/core-backend/services/backtest.service.ts"
const MARKET_REPOSITORY = "apps/market-service/repositories/market.repository.ts"

// Le moteur ne convertit aucun cours : un montant est exprimé dans la devise de cotation des actifs, affichée en euros
const MONEY_UNIT = "Montant affiché en euros. Les cours ne sont pas convertis : pour un actif coté en dollars, le montant est en réalité en dollars."

// Rendement d'une journée hors versements : base commune du CAGR, de la volatilité, du Sharpe et du drawdown
const TWR_SENTENCE =
    "Le moteur chaîne jour après jour la performance du portefeuille, mesurée avant le versement du jour : un versement mensuel n’est pas compté comme une performance (rendement pondéré dans le temps, TWR)."

export const GLOSSARY = {
    // Résultat d'un backtest
    finalValue: {
        title: "Valeur finale",
        purpose: "Ce que vaut le portefeuille au dernier jour de la période : le montant que tu aurais en le liquidant ce jour-là, avant frais de vente.",
        computation: "Somme, pour chaque actif, de la quantité détenue multipliée par son dernier cours de clôture connu. Les frais déjà payés sont déduits, puisqu’ils ont réduit les quantités achetées.",
        formula: "valeur finale = Σ quantité(actif) × cours(actif, dernier jour)",
        unit: MONEY_UNIT,
        readingTip: "À comparer au montant investi : l’écart entre les deux est la plus-value.",
        source: `${ENGINE} · simulate (finalValue)`,
    },
    profit: {
        title: "Plus-value",
        purpose: "Le gain (ou la perte) en euros, une fois retiré tout ce que tu as versé.",
        computation: "Valeur finale moins montant total investi.",
        formula: "plus-value = valeur finale − montant investi",
        unit: `${MONEY_UNIT} Négatif en cas de perte.`,
        source: `${ENGINE} · simulate (profit)`,
    },
    totalInvested: {
        title: "Montant investi",
        purpose: "Tout l’argent sorti de ta poche : capital initial et, en DCA, chaque versement.",
        computation: "Somme des versements, frais compris : un ordre de 6 000 € coûte 6 000 €, dont les frais. Le rebalancement s’autofinance et ne l’augmente pas.",
        unit: MONEY_UNIT,
        source: `${ENGINE} · simulate (totalInvested)`,
    },
    totalReturn: {
        title: "Rendement total",
        purpose: "Le gain rapporté à ce que tu as versé, sur toute la période, sans tenir compte de sa durée.",
        computation: "Plus-value divisée par le montant investi. En DCA, les derniers versements ont eu peu de temps pour travailler : ce rendement ne se compare pas d’une durée à l’autre, utilise le CAGR pour cela.",
        formula: "rendement total = (valeur finale − montant investi) / montant investi",
        unit: "Ratio affiché en pourcentage.",
        readingTip: "+15 % : pour 100 € versés, il en reste 115 € à la fin.",
        source: `${ENGINE} · simulate (totalReturn)`,
    },
    cagr: {
        title: "CAGR (rendement annualisé)",
        purpose: "Le rendement moyen par an, pour comparer des stratégies sur des durées différentes.",
        computation: `${TWR_SENTENCE} La performance cumulée est ensuite ramenée à une année de 365,25 jours calendaires, y compris pour une période de moins d’un an (extrapolation).`,
        formula: "CAGR = (indice final / indice initial)^(365,25 / jours) − 1",
        unit: "Ratio annuel affiché en pourcentage.",
        readingTip: "+7 % : le portefeuille a progressé en moyenne de 7 % par an. Sur moins d’un an, le chiffre extrapole et peut paraître extrême.",
        source: `${ENGINE_UTILS} · annualizedReturn`,
    },
    volatility: {
        title: "Volatilité",
        purpose: "L’amplitude des variations du portefeuille : plus elle est haute, plus le parcours est agité.",
        computation: `${TWR_SENTENCE} Le moteur prend l’écart-type de ces rendements journaliers (sur tout l’historique simulé), puis l’annualise en le multipliant par √252, le nombre de jours de cotation d’une année.`,
        formula: "volatilité = écart-type(rendements journaliers) × √252",
        unit: "Ratio annuel affiché en pourcentage.",
        readingTip: "15 % : sur une année, le rendement s’écarte typiquement de ±15 % de sa moyenne.",
        source: `${ENGINE_UTILS} · annualizedVolatility`,
    },
    sharpeRatio: {
        title: "Ratio de Sharpe",
        purpose: "Le rendement obtenu par unité de risque pris : il départage deux stratégies au rendement proche.",
        computation: "CAGR moins le taux sans risque, divisé par la volatilité annualisée. Absent si la volatilité est nulle.",
        formula: "Sharpe = (CAGR − taux sans risque) / volatilité",
        unit: "Sans unité.",
        readingTip: "Au-dessus de 1, le rendement rémunère bien le risque ; sous 0, la stratégie a fait moins bien que le placement sans risque.",
        source: `${ENGINE_UTILS} · sharpeRatio`,
    },
    riskFreeRate: {
        title: "Taux sans risque",
        purpose: "Le rendement d’un placement sans risque, soustrait au CAGR dans le ratio de Sharpe.",
        computation: "Hypothèse fixe du moteur, publiée avec chaque résultat pour savoir avec quel taux le Sharpe a été calculé.",
        unit: "Ratio annuel affiché en pourcentage.",
        source: `${ENGINE_UTILS} · RISK_FREE_RATE`,
    },
    maxDrawdown: {
        title: "Max drawdown",
        purpose: "La pire perte subie en cours de route : la plus forte baisse du portefeuille depuis son plus-haut précédent. C’est le « pire moment » qu’il aurait fallu encaisser sans vendre.",
        computation: `${TWR_SENTENCE} Chaque jour, le moteur compare cet indice à son plus-haut atteint jusque-là ; le max drawdown est la baisse la plus profonde. La note du bloc donne la date de ce plus-haut.`,
        formula: "drawdown(t) = indice(t) / max indice(s ≤ t) − 1\nmax drawdown = min drawdown(t)",
        unit: "Ratio affiché en pourcentage, toujours ≤ 0 %. 0 % signifie aucune baisse.",
        readingTip: "−12,99 % : à son pire moment, le portefeuille valait 12,99 % de moins que son meilleur niveau précédent. Plus le chiffre est proche de 0, plus le parcours a été régulier.",
        source: `${ENGINE_UTILS} · createDrawdownTracker`,
    },
    recovery: {
        title: "Récupération",
        purpose: "Le temps qu’il a fallu pour effacer la pire baisse (max drawdown).",
        computation: `${TWR_SENTENCE} La récupération compte les jours calendaires entre le plus-haut de cet indice qui précède la pire baisse et le premier jour où l’indice retrouve ce niveau. En DCA, la valeur du portefeuille peut remonter plus tôt grâce aux versements : elle n’entre pas en compte. Sans retour au plus-haut avant la fin de la période, la baisse n’est pas récupérée.`,
        unit: "Durée en jours calendaires, affichée en jours, mois ou années.",
        readingTip: "4 mois : il a fallu 4 mois pour revenir au niveau d’avant la baisse. « Non récupéré » : le plus-haut n’a pas été retrouvé.",
        source: `${ENGINE_UTILS} · createDrawdownTracker (recoveryDays)`,
    },
    equityCurve: {
        title: "Courbe de valeur",
        purpose: "Suivre la valeur du portefeuille jour après jour sur la période, versements compris.",
        computation: "Chaque jour de cotation, valeur des positions au cours de clôture, après le versement et le rebalancement éventuels du jour. Un cours manquant est reporté du dernier jour connu.",
        unit: `${MONEY_UNIT} Un point par jour de cotation.`,
        readingTip: "En DCA, la courbe monte aussi à chaque versement : pour juger la performance, lis le CAGR ou le drawdown, qui ignorent les versements.",
        source: `${ENGINE} · simulate (equityCurve)`,
    },
    drawdownCurve: {
        title: "Courbe de drawdown",
        purpose: "Voir, pour chaque jour, de combien le portefeuille est sous son plus-haut précédent.",
        computation: `${TWR_SENTENCE} Chaque point vaut l’indice du jour divisé par son plus-haut atteint jusque-là, moins 1.`,
        formula: "drawdown(t) = indice(t) / max indice(s ≤ t) − 1",
        unit: "Ratio affiché en pourcentage, toujours ≤ 0 %.",
        readingTip: "La courbe touche 0 % à chaque nouveau plus-haut ; son point le plus bas est le max drawdown.",
        source: `${ENGINE_UTILS} · createDrawdownTracker (record)`,
    },
    benchmark: {
        title: "Benchmark",
        purpose: "Un point de comparaison : la même épargne investie à 100 % dans un indice de référence (ETF), pour savoir si ta stratégie fait mieux qu’un placement passif.",
        computation: "Le moteur rejoue exactement les mêmes versements, aux mêmes dates et avec les mêmes frais, sur le seul symbole du benchmark, sans rebalancement. Ses métriques sont calculées comme celles du portefeuille.",
        unit: "Mêmes unités que les métriques du portefeuille.",
        readingTip: "Ses chiffres apparaissent dans la colonne à son symbole et en pointillés sur la courbe de valeur.",
        source: `${ENGINE} · runBacktest (benchmark)`,
    },
    lumpSum: {
        title: "Investissement unique et écart du DCA",
        purpose: "Répondre à « valait-il mieux tout investir le premier jour ? » pour une stratégie en versements mensuels (DCA).",
        computation: "Le moteur rejoue le même total versé en un seul achat le premier jour : même capital, même période, mêmes frais, seule la répartition dans le temps change. L’écart est la valeur finale du DCA moins celle de l’investissement unique.",
        formula: "écart = valeur finale (DCA) − valeur finale (investissement unique)",
        unit: MONEY_UNIT,
        readingTip: "Un écart positif signifie que le DCA a fait mieux. Sans benchmark, l’investissement unique est la courbe en pointillés.",
        source: `${ENGINE} · runBacktest (lumpSumComparison, dcaAdvantage)`,
    },
    totalFees: {
        title: "Frais payés",
        purpose: "Le coût total des ordres passés pendant la simulation, achats et ventes de rebalancement compris.",
        computation: "Somme, sur chaque ordre, du montant de l’ordre multiplié par le taux de frais. Les frais sont déjà déduits de la valeur finale.",
        formula: "frais = Σ montant(ordre) × taux de frais",
        unit: MONEY_UNIT,
        source: `${ENGINE} · simulate (totalFees)`,
    },
    totalTrades: {
        title: "Ordres",
        purpose: "Le nombre d’ordres d’achat et de vente passés : un indicateur de l’activité et donc des frais.",
        computation: "Un achat par actif à chaque versement (réparti selon les poids). À chaque rebalancement, une vente par actif au-dessus de sa cible et un achat par actif en dessous, si l’écart atteint au moins 0,01.",
        unit: "Nombre d’ordres.",
        source: `${ENGINE} · simulate (trades)`,
    },
    rebalanceCount: {
        title: "Rebalancements",
        purpose: "Le nombre de fois où le portefeuille a été ramené à ses poids cibles.",
        computation: "Au premier jour de cotation de chaque période (mois, trimestre, année), hors premier jour, le moteur vend les lignes au-dessus de leur poids cible et rachète celles en dessous, sans apport d’argent. Le jour n’est compté que si au moins une ligne dépasse sa cible et une autre est en dessous, d’un écart d’au moins 0,01.",
        unit: "Nombre de rebalancements.",
        source: `${ENGINE} · simulate (rebalanceCount)`,
    },
    holdingQuantity: {
        title: "Quantité détenue",
        purpose: "Le nombre de titres de chaque actif détenus au dernier jour.",
        computation: "Somme des titres achetés moins ceux vendus au rebalancement. Les achats sont fractionnaires : (montant de l’ordre − frais) / cours.",
        unit: "Nombre de titres, jusqu’à 6 décimales.",
        source: `${ENGINE} · simulate (holdings)`,
    },
    holdingValue: {
        title: "Valeur d’une position",
        purpose: "Ce que pèse chaque actif dans la valeur finale.",
        computation: "Quantité détenue multipliée par le dernier cours de clôture connu de l’actif.",
        formula: "valeur = quantité × cours (dernier jour)",
        unit: MONEY_UNIT,
        source: `${ENGINE} · simulate (holdings)`,
    },
    tradeSide: {
        title: "Côté de l’ordre",
        purpose: "Distinguer un achat d’une vente.",
        computation: "Achat à chaque versement et pour les lignes sous leur cible au rebalancement ; vente pour les lignes au-dessus de leur cible.",
        unit: "Achat ou vente.",
        source: `${ENGINE} · simulate (trades)`,
    },
    tradePrice: {
        title: "Prix d’exécution",
        purpose: "Le cours auquel l’ordre a été exécuté.",
        computation: "Cours de clôture, ajusté des divisions d’actions, du jour du versement ou du rebalancement.",
        unit: "Cours de l’actif dans sa devise de cotation, sans conversion.",
        source: `${ENGINE} · simulate (trades)`,
    },
    tradeQuantity: {
        title: "Quantité de l’ordre",
        purpose: "Le nombre de titres achetés ou vendus.",
        computation: "Achat : (montant − frais) / prix. Vente : nombre de titres cédés pour revenir au poids cible.",
        unit: "Nombre de titres, jusqu’à 6 décimales.",
        source: `${ENGINE} · simulate (trades)`,
    },
    tradeAmount: {
        title: "Montant de l’ordre",
        purpose: "L’argent engagé ou encaissé par l’ordre.",
        computation: "Achat : montant payé, frais compris (part du versement selon le poids de l’actif). Vente : produit brut, quantité × prix, avant frais.",
        unit: MONEY_UNIT,
        source: `${ENGINE} · simulate (trades)`,
    },
    tradeFee: {
        title: "Frais de l’ordre",
        purpose: "Ce que l’ordre a coûté en frais.",
        computation: "Montant de l’ordre multiplié par le taux de frais. Payé sur l’achat, retenu sur le produit de la vente.",
        formula: "frais = montant × taux de frais",
        unit: MONEY_UNIT,
        source: `${ENGINE} · simulate (trades)`,
    },

    // Hypothèses
    executionRule: {
        title: "Règle d’exécution",
        purpose: "Dire à quel prix les ordres sont simulés, pour éviter d’utiliser un cours qu’on ne pouvait pas connaître (biais d’anticipation).",
        computation: "Chaque versement est planifié : il est exécuté au cours de clôture du jour de son échéance.",
        unit: "Règle nommée.",
        source: `${ENGINE} · runBacktest (executionRule)`,
    },
    dataSource: {
        title: "Source des données",
        purpose: "Savoir d’où viennent les cours rejoués et de quel type de prix il s’agit.",
        computation: "Fournisseur des cours (Yahoo Finance) et type de prix : clôture ajustée des divisions d’actions, dividendes non réinvestis.",
        unit: "Fournisseur · type de prix.",
        source: "packages/contracts/src/backtest.ts · PRICE_DATA_SOURCE",
    },
    dataFingerprint: {
        title: "Empreinte des données",
        purpose: "Identifier exactement les cours utilisés : deux exécutions à la même empreinte ont rejoué les mêmes données.",
        computation: "Empreinte SHA-256 des séries de cours, indépendante de l’ordre des symboles : elle change dès qu’un cours, une date ou un symbole change. Seuls les premiers caractères sont affichés ; le survol montre l’empreinte complète.",
        unit: "Hexadécimal (64 caractères).",
        readingTip: "Deux résultats différents avec la même empreinte viennent des paramètres, pas des données.",
        source: `${ENGINE_UTILS} · fingerprintPrices`,
    },

    // Récapitulatif du formulaire « Nouveau backtest »
    plannedContributions: {
        title: "Versements prévus",
        purpose: "Savoir combien de fois de l’argent entrera dans le portefeuille avant de lancer le backtest.",
        computation: "Estimation sur les jours ouvrés de la période (lundi à vendredi) : 1 en investissement unique ; en DCA, un versement par mois, le premier jour recevant aussi le capital initial. Les jours fériés sont inconnus avant le chargement des cours.",
        unit: "Nombre de jours de versement.",
        source: `${BACKTEST_SERVICE} · preview (contributionCount)`,
    },
    plannedRebalances: {
        title: "Rebalancements prévus",
        purpose: "Estimer combien de fois le portefeuille sera ramené à ses poids cibles.",
        computation: "Nombre de périodes de rebalancement (mois, trimestre, année) sur les jours ouvrés de la période, moins la première. Estimation haute : à l’exécution, un rebalancement sans écart suffisant n’est pas compté.",
        unit: "Nombre de rebalancements.",
        source: `${BACKTEST_SERVICE} · preview (rebalanceCount)`,
    },

    // Liste des backtests
    completedRate: {
        title: "Taux de réussite",
        purpose: "La part de tes backtests dont la dernière exécution s’est terminée avec un résultat.",
        computation: "Backtests dont la dernière exécution est terminée, divisés par le nombre total de backtests (0 sans backtest).",
        formula: "taux = terminés / total",
        unit: "Ratio affiché en pourcentage.",
        source: `${BACKTEST_SERVICE} · getStats (completedRate)`,
    },
    failedRate: {
        title: "Taux d’échec",
        purpose: "La part de tes backtests dont la dernière exécution a échoué (données manquantes, erreur du moteur).",
        computation: "Backtests dont la dernière exécution a échoué, divisés par le nombre total de backtests (0 sans backtest).",
        formula: "taux = échoués / total",
        unit: "Ratio affiché en pourcentage.",
        source: `${BACKTEST_SERVICE} · getStats (failedRate)`,
    },
    executionDuration: {
        title: "Durée d’exécution",
        purpose: "Le temps de calcul de la dernière exécution, de son démarrage par le moteur à son résultat.",
        computation: "Écart entre l’heure de fin et l’heure de démarrage de l’exécution (ou de sa création si elle n’a pas d’heure de démarrage). Absente tant que l’exécution n’est pas finie.",
        unit: "Durée en minutes et secondes.",
        source: "apps/web/src/features/backtest/utils.tsx · getExecutionDuration (durée entre deux timestamps de l’API)",
    },

    // Comparaison
    comparisonDelta: {
        title: "Écart A − B",
        purpose: "Mesurer d’un coup d’œil de combien A fait mieux ou moins bien que B sur chaque métrique.",
        computation: "Métrique de A moins la même métrique de B. Vert si l’écart est favorable à A (plus de rendement, moins de volatilité, un drawdown moins profond), rouge sinon.",
        formula: "écart = métrique(A) − métrique(B)",
        unit: "Points de pourcentage pour les ratios (pts), sans unité pour le Sharpe.",
        readingTip: "+4,4 pts de CAGR : A rapporte 4,4 % de plus par an que B.",
        source: `${BACKTEST_SERVICE} · compare (deltas)`,
    },

    // Paramètres d'un backtest
    investmentMode: {
        title: "Mode d’investissement",
        purpose: "Choisir comment l’argent entre dans le portefeuille : tout le premier jour, ou par versements réguliers (DCA).",
        computation: "Investissement unique : le capital initial est investi le premier jour. Versements mensuels (DCA) : le premier jour reçoit le capital initial et le premier versement mensuel, puis un versement au premier jour de cotation de chaque mois suivant.",
        unit: "Mode.",
        readingTip: "En DCA, le résultat montre aussi ce qu’aurait donné le même total investi en une fois.",
        source: `${ENGINE} · simulate (initialAmount, recurringAmount)`,
    },
    allocation: {
        title: "Actifs et poids",
        purpose: "Définir la répartition cible du portefeuille entre ses actifs.",
        computation: "Chaque versement est réparti entre les actifs selon leur poids ; la somme des poids vaut 100 %. Le rebalancement ramène le portefeuille à ces poids.",
        unit: "Poids en pourcentage, somme = 100 %.",
        source: `${ENGINE} · simulate (allocations)`,
    },
    feeRate: {
        title: "Frais par ordre",
        purpose: "Simuler le coût de courtage, qui réduit la performance à chaque achat et vente.",
        computation: "Pourcentage prélevé sur le montant de chaque ordre, achat comme vente.",
        formula: "frais = montant de l’ordre × taux de frais",
        unit: "Pourcentage du montant de l’ordre.",
        source: `${ENGINE} · simulate (feeRate)`,
    },
    rebalanceFrequency: {
        title: "Rebalancement",
        purpose: "Ramener régulièrement le portefeuille à ses poids cibles, pour que l’actif qui a le plus monté ne prenne pas toute la place.",
        computation: "Au premier jour de cotation de chaque période, le moteur vend les lignes au-dessus de leur cible et rachète celles en dessous, sans apport d’argent. Chaque ordre paie des frais. « Aucun » : jamais de vente.",
        unit: "Fréquence (aucun, mensuel, trimestriel, annuel).",
        source: `${ENGINE} · simulate (rebalanceFrequency)`,
    },

    // Marché
    price: {
        title: "Prix",
        purpose: "Le dernier cours connu de l’actif.",
        computation: "Cours de marché de la séance en cours, ou de clôture si le marché est fermé, fourni par Yahoo Finance.",
        unit: "Montant dans la devise affichée.",
        source: `${MARKET_REPOSITORY} · getAssets (regularMarketPrice)`,
    },
    change24h: {
        title: "Variation 24 h",
        purpose: "De combien l’actif a bougé depuis la dernière clôture.",
        computation: "Variation du cours actuel par rapport à la clôture précédente, fournie par Yahoo Finance.",
        formula: "variation = (prix − clôture précédente) / clôture précédente",
        unit: "Pourcentage.",
        source: `${MARKET_REPOSITORY} · getAssets (regularMarketChangePercent)`,
    },
    volume24h: {
        title: "Volume 24 h",
        purpose: "L’activité sur l’actif : un volume élevé signale beaucoup d’échanges, donc un prix plus fiable.",
        computation: "Nombre de titres échangés pendant la séance en cours, fourni par Yahoo Finance.",
        unit: "Nombre de titres, abrégé (k, M, Md).",
        source: `${MARKET_REPOSITORY} · getAssets (regularMarketVolume)`,
    },
    trend: {
        title: "Tendance",
        purpose: "Voir d’un coup d’œil l’évolution du cours sur les dernières 24 heures.",
        computation: "Cours de clôture horaires des dernières 24 heures ; vert si la variation est positive, rouge sinon.",
        unit: "Mini-courbe sans axe.",
        source: `${MARKET_REPOSITORY} · getAssets (history)`,
    },
    priceChart: {
        title: "Graphique de prix",
        purpose: "Suivre le cours de l’actif sur la période choisie.",
        computation: "Cours de clôture fournis par Yahoo Finance, un point par intervalle (5 min sur 1 jour, 1 h sur 1 semaine, 1 jour sur 1 mois, 1 semaine sur 1 an, 1 mois au-delà). Un intervalle sans clôture (marché fermé) est omis.",
        unit: "Montant dans la devise affichée.",
        source: `${MARKET_REPOSITORY} · getDetails`,
    },
} satisfies Record<string, GlossaryEntry>

export type GlossaryKey = keyof typeof GLOSSARY
