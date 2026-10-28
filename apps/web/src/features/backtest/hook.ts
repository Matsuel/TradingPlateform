import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBacktest, getBacktest, getBacktests, getBacktestStats, rerunBacktest } from "./api";
import { activeStatuses } from "./constants";
import { hasStatus } from "./utils";

export function useCreateBacktest() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createBacktest,
        onSuccess: () => Promise.all([
            queryClient.invalidateQueries({ queryKey: ["backtest", "list"] }),
            queryClient.invalidateQueries({ queryKey: ["backtest", "stats"] }),
        ]),
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
        refetchInterval: (query) => query.state.data && hasStatus(query.state.data, activeStatuses) ? 2000 : false,
    })
}

export function useRerunBacktest(id: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => rerunBacktest(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backtest"] }),
    })
}
