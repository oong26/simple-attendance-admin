import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCircle2Icon, CircleAlertIcon, CircleX, Info, X } from 'lucide-react';
import { useEffect, useState, type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { flash } = usePage().props as PageProps;
    const [showAlert, setShowAlert] = useState(true);
    useEffect(() => {
        if (flash?.message) {
            setShowAlert(true);
        }
    }, [flash?.message]);


    const getAlertStyles = () => {
        switch (flash?.type) {
            case 'success':
                return "border-green-500 text-green-700";
            case 'warning':
                return "border-yellow-500 text-yellow-700";
            case 'error':
                return "border-red-500 text-red-700";
            default:
                return "";
        }
    };

    const getIcon = () => {
        switch (flash?.type) {
            case 'success':
                return <CheckCircle2Icon />;
            case 'warning':
                return <CircleAlertIcon />;
            case 'error':
                return <CircleX />;
            default:
                return <Info />;
        }
    };

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {showAlert && flash && flash.message && (
                    <div className="m-4 relative">
                        <Alert className={getAlertStyles()}>
                            {getIcon()}
                            <AlertTitle>
                                {flash.type === 'success' && "Success"}
                                {flash.type === 'warning' && "Warning"}
                                {flash.type === 'error' && "Error"}
                            </AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                            
                            {/* Close button */}
                            <button
                                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground hover:cursor-pointer"
                                onClick={() => setShowAlert(false)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </Alert>
                    </div>
                )}
                {children}
            </AppContent>
        </AppShell>
    );
}
