/** Tiret gris « — » d'une valeur absente (résultat antérieur au champ, donnée non chargée). */
export function Dash() {
    return <span className="text-muted-foreground">—</span>
}

/** `format(value)`, ou `<Dash />` si la valeur manque (résultat antérieur au champ, moins de deux points). */
export const orDash = (value: number | null | undefined, format: (v: number) => string) =>
    value == null ? <Dash /> : format(value)
