import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs = [], ...props }: AppLayoutProps) {
    const { flash } = usePage().props as any;

    // Display flash messages using toast when they arrive from backend
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }

        if (flash?.warning) {
            toast.warning(flash.warning);
        }

        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
}
