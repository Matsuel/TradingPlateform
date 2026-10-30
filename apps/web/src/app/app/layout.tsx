import { AppSidebar } from '@/components/app-sidebar';
import Header from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { hasAdminRole, requireSession } from '@/lib/session';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Trading platform",
    description: "Oui",
};

const AppLayout = async ({ children }: LayoutProps<"/">) => {
    const session = await requireSession();
    const admin = hasAdminRole(session.user.role);

    return (
        <SidebarProvider>
            <AppSidebar user={session.user} isAdmin={admin} />
            <main className='w-full'>
                <SidebarInset>
                    <Header />
                    {children}
                </SidebarInset>
            </main>
        </SidebarProvider>
    )
}

export default AppLayout; 