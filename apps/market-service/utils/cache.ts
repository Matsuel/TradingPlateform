// Nombre maximal d'entrées gardées : au-delà, la plus ancienne est retirée
const MAX_ENTRIES = 500;

/**
 * Cache mémoire à durée de vie par entrée. Garde la promesse en cours : deux appels simultanés de la même clé n'interrogent
 * le fournisseur qu'une fois. Un échec n'est pas gardé (l'appel suivant réessaie).
 */
export class TtlCache {
    private readonly entries = new Map<string, { value: Promise<unknown>; expiresAt: number }>();

    async getOrLoad<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
        const hit = this.entries.get(key);
        if (hit && hit.expiresAt > Date.now()) return hit.value as Promise<T>;

        const value = load();
        this.entries.set(key, { value, expiresAt: Date.now() + ttlMs });
        value.catch(() => this.entries.delete(key));

        if (this.entries.size > MAX_ENTRIES) this.entries.delete(this.entries.keys().next().value!);
        return value;
    }
}
