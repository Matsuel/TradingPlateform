import { Badge } from "@/components/ui/badge"
import { statusBadges } from "./constants"
import type { ExecutionStatus } from "./types"

/** Badge du statut d'une exécution (libellé et couleur de `statusBadges`). */
export function StatusBadge({ status }: { status: ExecutionStatus }) {
    const { label, variant } = statusBadges[status]
    return <Badge variant={variant}>{label}</Badge>
}
