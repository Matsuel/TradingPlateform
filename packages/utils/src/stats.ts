/**
 * Médiane d'une liste de nombres non vide (non triée acceptée, l'entrée n'est pas modifiée) : moyenne des deux valeurs
 * centrales si le nombre est pair. Une liste vide n'a pas de médiane : le résultat est `NaN`.
 */
export const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = sorted.length >> 1;
    return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};
