import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBacktest, getBacktests } from "./api";

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
