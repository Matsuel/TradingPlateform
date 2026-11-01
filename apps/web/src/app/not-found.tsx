import Link from "next/link"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-[112px] font-bold text-border">404</h1>
                <h2 className="text-h2">Page introuvable</h2>
                <p className="text-body text-muted-foreground">La page que vous cherchez n’existe pas ou a été déplacée.</p>
                <div className="flex flex-row gap-3">
                    <Button size="lg" nativeButton={false} render={<Link href={routes.dashboard} />}>
                        Retour au dashboard
                    </Button>
                    <Button size="lg" variant="outline" nativeButton={false} render={<Link href={routes.market} />}>
                        Voir le marché
                    </Button>
                </div>
            </div>
        </div>
    )
}
