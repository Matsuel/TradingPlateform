import { CACHE_MAX_ENTRIES } from "../constants/market.constants";

type Entry = { value: Promise<unknown>; expiresAt: number };

/**
 * Cache mémoire à durée de vie par entrée. Garde la promesse en cours : deux appels simultanés de la même clé n'interrogent
 * le fournisseur qu'une fois. Un échec n'est pas gardé (l'appel suivant réessaie). Au-delà de `CACHE_MAX_ENTRIES`, les
 * entrées expirées sont retirées, puis la plus ancienne si le cache est encore plein.
 */
export class TtlCache {
    private readonly entries = new Map<string, Entry>();

    async getOrLoad<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
        const hit = this.entries.get(key);
        if (hit && hit.expiresAt > Date.now()) return hit.value as Promise<T>;

        const value = load();
        const entry: Entry = { value, expiresAt: Date.now() + ttlMs };
        this.entries.set(key, entry);
        // Retire l'entrée seulement si elle n'a pas été remplacée entre-temps par un appel plus récent
        value.catch(() => this.delete(key, entry));

        if (this.entries.size > CACHE_MAX_ENTRIES) this.evict();
        return value;
    }

    /** Oublie `key` (ou seulement `entry` si elle est précisée et encore en place). */
    delete(key: string, entry?: Entry): void {
        if (!entry || this.entries.get(key) === entry) this.entries.delete(key);
    }

    private evict(): void {
        const now = Date.now();
        for (const [key, { expiresAt }] of this.entries) if (expiresAt <= now) this.entries.delete(key);
        if (this.entries.size > CACHE_MAX_ENTRIES) this.entries.delete(this.entries.keys().next().value!);
    }
}
