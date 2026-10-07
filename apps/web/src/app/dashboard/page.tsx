"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth";

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!isPending && !session) router.replace("/login");
    }, [isPending, session, router]);

    if (isPending) return <p>Chargement...</p>;
    if (!session) return null;

    const { user } = session;

    return (
        <main className="mx-auto mt-20 flex max-w-md flex-col gap-3">
            <h1 className="text-2xl font-bold">Bonjour {user.name}</h1>
            <p>Email : {user.email}</p>
            <p>ID : {user.id}</p>

            <button
                onClick={async () => {
                    await authClient.signOut();
                    router.push("/login");
                }}
                className="rounded bg-black p-2 text-white"
            >
                Se déconnecter
            </button>
        </main>
    );
}