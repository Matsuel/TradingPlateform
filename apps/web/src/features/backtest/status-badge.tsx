import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { statusVariants } from "./constants"
import type { ExecutionStatus } from "./types"

/** Badge du statut d'une exécution (libellé `backtest.status.<statut>`, couleur de `statusVariants`). */
export function StatusBadge({ status }: { status: ExecutionStatus }) {
    const t = useTranslations("backtest.status")
    return <Badge variant={statusVariants[status]}>{t(status)}</Badge>
}
