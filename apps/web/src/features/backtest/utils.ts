import type { Backtest, BacktestExecution, ExecutionStatus } from "./types"

export const getExecution = (b: Backtest) => b.executions[0]

export function hasStatus(b: Backtest, statuses: readonly ExecutionStatus[]) {
    const status = getExecution(b)?.status
    return status !== undefined && statuses.includes(status)
}

export function getDuration(b: Backtest) {
    const e = getExecution(b)
    if (!e?.startedAt || !e.finishedAt) return null
    const minutes = Math.max(1, Math.round((+new Date(e.finishedAt) - +new Date(e.startedAt)) / 60_000))
    return `${minutes} min`
}

export function getExecutionDuration(e: BacktestExecution) {
    if (!e.finishedAt) return null
    const seconds = Math.max(1, Math.round((+new Date(e.finishedAt) - +new Date(e.startedAt ?? e.createdAt)) / 1000))
    const minutes = Math.floor(seconds / 60)
    return minutes ? `${minutes} min ${seconds % 60} s` : `${seconds} s`
}
