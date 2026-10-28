import type { BacktestStatus } from "../generated/prisma/client"

// Une exécution dans ces statuts peut encore évoluer
export const ACTIVE_STATUSES: BacktestStatus[] = ["PENDING", "RUNNING"]
