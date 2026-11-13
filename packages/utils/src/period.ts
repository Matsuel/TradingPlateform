/** Millisecondes dans un jour calendaire. */
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Fréquence calendaire d'un versement ou d'un rebalancement ; `DAILY` ou null : chaque jour est sa propre période. */
export type PeriodFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | null;

/**
 * Clé de la période d'un jour `YYYY-MM-DD` : deux jours de même clé sont dans la même période. Un versement récurrent
 * (ou un rebalancement) a lieu au premier jour de cotation dont la clé diffère de la veille. Semaines du lundi au dimanche.
 * Partagée par backtest-engine (simulation) et core-backend (récapitulatif prévisionnel) pour qu'ils comptent les mêmes périodes.
 */
export const periodKey = (date: string, frequency: PeriodFrequency) => {
    switch (frequency) {
        case "WEEKLY":
            // 1970-01-01 est un jeudi : +3 jours fait commencer les semaines le lundi
            return String(Math.floor((Date.parse(date) / DAY_MS + 3) / 7));
        case "MONTHLY":
            return date.slice(0, 7);
        case "QUARTERLY":
            return `${date.slice(0, 4)}-Q${Math.ceil(Number(date.slice(5, 7)) / 3)}`;
        case "YEARLY":
            return date.slice(0, 4);
        default:
            return date;
    }
};

/**
 * `date` + `years` années civiles, en UTC, à minuit (l'heure est écartée). `years` peut être négatif.
 * Un 29 février retombe le 1er mars quand l'année cible n'est pas bissextile.
 */
export const addYears = (date: Date, years: number) =>
    new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate()));
