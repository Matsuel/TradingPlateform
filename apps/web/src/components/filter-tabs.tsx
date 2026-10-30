"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FilterTabsProps<T extends string> {
    value: T
    onChange: (value: T) => void
    options: { value: T; label: string }[]
    className?: string
}

export function FilterTabs<T extends string>({ value, onChange, options, className }: FilterTabsProps<T>) {
    return (
        <Tabs value={value} onValueChange={(v) => onChange(v as T)} className={className}>
            <TabsList>
                {options.map((o) => (
                    <TabsTrigger key={o.value} value={o.value}>{o.label}</TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
