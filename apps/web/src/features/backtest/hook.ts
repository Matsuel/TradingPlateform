import { keepPreviousData, skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    compareBacktests,
    createBacktest,
    createBacktestBatch,
    getBacktest,
    getBacktestBatch,
    getBacktestStats,
    getBacktests,
    previewBacktest,
    rerunBacktest,
    rerunBacktestBatch,
    restartBacktestBatch,
} from "./api"
import { activeStatuses } from "./constants"
import type { BacktestValues } from "./schema"
import { hasStatus, isActiveStatus } from "./utils"

export function useCreateBacktest() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createBacktest,
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["backtest", "list"] }),
                queryClient.invalidateQueries({ queryKey: ["backtest", "stats"] }),
            ]),
    })
}

export function useCreateBacktestBatch() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createBacktestBatch,
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["backtest", "list"] }),
                queryClient.invalidateQueries({ queryKey: ["backtest", "stats"] }),
            ]),
    })
}

// values null (formulaire invalide) : aucune requête
export function useBacktestPreview(values: BacktestValues | null) {
    return useQuery({
        queryKey: ["backtest", "preview", values],
        queryFn: values ? () => previewBacktest(values) : skipToken,
        placeholderData: keepPreviousData, // garde les nombres affichés pendant le recalcul
    })
}

export function useBacktests(params: Parameters<typeof getBacktests>[0]) {
    return useQuery({
        queryKey: ["backtest", "list", params],
        queryFn: () => getBacktests(params),
        placeholderData: keepPreviousData, // garde la page affichée pendant le chargement de la suivante
    })
}

export function useBacktestStats() {
    return useQuery({
        queryKey: ["backtest", "stats"],
        queryFn: getBacktestStats,
    })
}

export function useBacktest(id: string) {
    return useQuery({
        queryKey: ["backtest", "detail", id],
        queryFn: () => getBacktest(id),
        // Rafraîchit tant que la dernière exécution n'est pas terminée
        refetchInterval: (query) => (query.state.data && hasStatus(query.state.data, activeStatuses) ? 2000 : false),
    })
}

// Rafraîchit tant qu'un départ du lot n'est pas terminé
export function useBacktestBatch(batchId: string) {
    return useQuery({
        queryKey: ["backtest", "batch", batchId],
        queryFn: () => getBacktestBatch(batchId),
        refetchInterval: (query) =>
            query.state.data?.rows.some(({ status }) => isActiveStatus(status)) ? 2000 : false,
    })
}

// Requête seulement avec deux ids distincts (l'API refuse sinon)
export function useBacktestComparison(a: string, b: string) {
    return useQuery({
        queryKey: ["backtest", "compare", a, b],
        queryFn: () => compareBacktests(a, b),
        enabled: Boolean(a && b) && a !== b,
    })
}

export function useRerunBacktest(id: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => rerunBacktest(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backtest"] }),
    })
}

// Une nouvelle liste de départs crée un autre lot : la page affichée passe à celui-ci
export function useRestartBacktestBatch(batchId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (startDates: Date[]) => restartBacktestBatch(batchId, startDates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backtest"] }),
    })
}

export function useRerunBacktestBatch(batchId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => rerunBacktestBatch(batchId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backtest"] }),
    })
}
