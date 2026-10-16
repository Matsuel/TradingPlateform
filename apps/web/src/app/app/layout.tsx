import { AppSidebar } from '@/components/app-sidebar';
import Header from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireSession } from '@/lib/session';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Trading platform",
    description: "Oui",
};

const AppLayout = async ({ children }: LayoutProps<"/">) => {

    const { user } = await requireSession()

    return (
        <SidebarProvider>
            <AppSidebar user={user} />
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