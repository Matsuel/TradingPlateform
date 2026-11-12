import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SettingsCardProps {
    title: string
    description: string
    children: ReactNode
}

/** Carte d'un réglage (maquette `06.2`) : titre et description, puis le contrôle ; marges de 24 px, bordure et ombre légère. */
export function SettingsCard({ title, description, children }: SettingsCardProps) {
    return (
        <Card size="compact" className="gap-4 rounded-lg border py-6 shadow-sm ring-0 [--card-spacing:--spacing(6)]">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}
