import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Trading platform",
    description: "Oui",
};

const AppLayout = ({ children }: LayoutProps<"/">) => {
    
    return (
        <SidebarProvider>
            <AppSidebar />
            <main>
                {children}
            </main>
        </SidebarProvider>
    )
}

export default AppLayout; 