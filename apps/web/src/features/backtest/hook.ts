import { useMutation, useQuery } from "@tanstack/react-query";
import { createBacktest, getBacktests } from "./api";

export function useCreateBacktest() {
    return useMutation({ mutationFn: createBacktest })
}

export function useBacktests() {
    return useQuery({
        queryKey: ["backtest", "list"],
        queryFn: getBacktests,
    })
}
