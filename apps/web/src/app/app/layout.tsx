import { AppSidebar } from '@/components/app-sidebar';
import Header from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Trading platform",
    description: "Oui",
};

const AppLayout = ({ children }: LayoutProps<"/">) => {

    return (
        <SidebarProvider>
            <AppSidebar />
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