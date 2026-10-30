import { useEffect, useState } from "react"

/**
 * `value` recopiée après `delayMs` ms sans changement : un appel API qui en dépend ne part qu'une fois la saisie posée.
 * Comparaison par référence : un objet doit garder sa référence tant que son contenu ne change pas (`useWatch` + `compute`).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs)
        return () => clearTimeout(timer)
    }, [value, delayMs])

    return debounced
}
