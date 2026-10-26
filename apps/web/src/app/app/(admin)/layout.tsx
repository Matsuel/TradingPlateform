import { redirect } from "next/navigation";
import { isAdmin, requireSession } from "@/lib/session";

interface AdminLayoutProps {
    children: React.ReactNode
}

export default async function AdminLayout({
    children,
}: AdminLayoutProps) {
    await requireSession();

    if (!(await isAdmin())) {
        redirect("/app");
    }

    return children;
}