import { InternshipStatsCard } from '@/components/admin/analytics/InternshipStatsCard';
import { StudentPerformanceCard } from '@/components/admin/analytics/StudentPerformanceCard';
import { SystemUsageCard } from '@/components/admin/analytics/SystemUsageCard';
// import { PlaceholderPattern } from '@/components/ui/placeholder-pattern'; // No longer needed for main content
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                {/* Top row cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <InternshipStatsCard />
                    <StudentPerformanceCard />
                    <SystemUsageCard />
                </div>

                {/* Placeholder for future, larger charts/tables */}
                {/* <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[50vh] flex-1 overflow-hidden rounded-xl border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-muted-foreground">More detailed analytics coming soon...</p>
                    </div>
                </div> */}
            </div>
        </AppLayout>
    );
}
