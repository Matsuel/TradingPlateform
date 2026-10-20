import { Button } from "@/components/ui/button"
import Link from "next/link"

const NotFoundPage = () => {
    return (
        <div className="w-full min-h-screen flex items-center justify-center">
            <div className="flex flex-col gap-2 items-center">
                <h1 className="text-[112px] font-bold text-border">
                    404
                </h1>
                <h2 className="text-h2">
                    Page introuvable
                </h2>
                <p className="text-body text-muted-foreground">
                    La page que vous cherchez n’existe pas ou a été déplacée.
                </p>
                <div className="flex flex-row gap-3">
                    <Link href={"/app"}>
                        <Button size={"lg"}>
                            Retour au dashboard
                        </Button>
                    </Link>

                    <Link href={"/app/market"}>
                        <Button size={"lg"} variant={"outline"}>
                            Voir le marché
                        </Button>
                    </Link>

                </div>
            </div>
        </div>
    )
}

export default NotFoundPage