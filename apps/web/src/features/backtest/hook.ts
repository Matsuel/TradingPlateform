import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBacktest, getBacktest, getBacktests, rerunBacktest } from "./api";
import { activeStatuses } from "./constants";
import { hasStatus } from "./utils";

export function useCreateBacktest() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createBacktest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backtest", "list"] }),
    })
}

export function useBacktests() {
    return useQuery({
        queryKey: ["backtest", "list"],
        queryFn: getBacktests,
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
