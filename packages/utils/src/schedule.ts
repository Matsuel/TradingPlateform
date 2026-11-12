import { DAY_MS, periodKey, type PeriodFrequency } from "./period";

/**
 * Jours ouvrés (lundi–vendredi, `YYYY-MM-DD`) de `start` inclus à `end` exclu, comme l'intervalle de cours demandé
 * par l'engine. Les dates du formulaire sont un minuit local sérialisé en UTC : l'arrondi au minuit UTC le plus proche
 * retrouve le jour saisi pour tout fuseau à ±12 h. Jours fériés inconnus avant le chargement des cours : estimation.
 */
export const businessDays = (start: Date, end: Date): string[] => {
    const days: string[] = [];
    for (let day = Math.round(start.getTime() / DAY_MS); day < Math.round(end.getTime() / DAY_MS); day++) {
        const date = new Date(day * DAY_MS);
        const weekday = date.getUTCDay();
        if (weekday !== 0 && weekday !== 6) days.push(date.toISOString().slice(0, 10));
    }
    return days;
};

/** Versements et rebalancements prévus d'un backtest avant son exécution. */
export interface ScheduleEstimate {
    // Nombre de versements : un seul en investissement unique, un par mois en versements récurrents
    contributionCount: number;
    // Nombre de rebalancements : un par période de la fréquence, hors la première
    rebalanceCount: number;
}

/**
 * Estime le calendrier d'un backtest sur les jours ouvrés de la période, avec les règles de l'engine : versement le premier
 * jour puis, en `RECURRING`, au premier jour de chaque mois ; rebalancement au premier jour de chaque période de
 * `rebalanceFrequency`, hors premier jour (`NONE` : aucun). Estimation : les jours fériés et le premier cours commun
 * des symboles ne sont connus qu'à l'exécution. Même `periodKey` que la simulation, donc mêmes périodes comptées.
 */
export const estimateSchedule = (
    start: Date,
    end: Date,
    investmentMode: "LUMP_SUM" | "RECURRING",
    rebalanceFrequency: Exclude<PeriodFrequency, null> | "NONE",
): ScheduleEstimate => {
    const days = businessDays(start, end);
    const periods = (frequency: Exclude<PeriodFrequency, null>) => new Set(days.map((day) => periodKey(day, frequency))).size;
    return {
        contributionCount: investmentMode === "RECURRING" ? periods("MONTHLY") : Math.min(days.length, 1),
        rebalanceCount: rebalanceFrequency === "NONE" ? 0 : Math.max(periods(rebalanceFrequency) - 1, 0),
    };
};
