import { InternshipStatsCard } from '@/components/admin/analytics/InternshipStatsCard';
import { StudentPerformanceCard } from '@/components/admin/analytics/StudentPerformanceCard';
import { SystemUsageCard } from '@/components/admin/analytics/SystemUsageCard';
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
            </div>
        </AppLayout>
    );
}
