import { FaqStatsCard } from '@/components/admin/analytics/FaqStatsCard';
import { GlobalVariableStatsCard } from '@/components/admin/analytics/GlobalVariableStatsCard';
import { GuidanceClassStatsCard } from '@/components/admin/analytics/GuidanceClassStatsCard';
import { InternshipStatsCard } from '@/components/admin/analytics/InternshipStatsCard';
import { LogbookSummaryCard } from '@/components/admin/analytics/LogbookSummaryCard';
import { ReportSummaryCard } from '@/components/admin/analytics/ReportSummaryCard';
import { StudentPerformanceCard } from '@/components/admin/analytics/StudentPerformanceCard';
import { SystemUsageCard } from '@/components/admin/analytics/SystemUsageCard';
import { TrashStatsCard } from '@/components/admin/analytics/TrashStatsCard';
import { TutorialStatsCard } from '@/components/admin/analytics/TutorialStatsCard';
import { UserStatsCard } from '@/components/admin/analytics/UserStatsCard';
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
            <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Top row - Overview cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <InternshipStatsCard />
                    <StudentPerformanceCard />
                    <SystemUsageCard />
                </div>

                {/* Second row - Core feature summaries */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <LogbookSummaryCard />
                    <ReportSummaryCard />
                    <GuidanceClassStatsCard />
                </div>

                {/* Third row - Content management */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <TutorialStatsCard />
                    <FaqStatsCard />
                    <GlobalVariableStatsCard />
                    <UserStatsCard />
                </div>

                {/* Bottom row - System maintenance */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-1 lg:grid-cols-2">
                    <TrashStatsCard />
                    {/* Future: Add system health or maintenance cards here */}
                </div>
            </div>
        </AppLayout>
    );
}
