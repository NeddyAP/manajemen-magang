import { NotificationSummaryCard } from '@/components/dashboard/NotificationSummaryCard';
import { PendingLogbooksCard } from '@/components/dashboard/dosen/PendingLogbooksCard';
import { PendingReportsCard } from '@/components/dashboard/dosen/PendingReportsCard';
import { QuickActionsCard } from '@/components/dashboard/dosen/QuickActionsCard';
import { SupervisedStudentsCard } from '@/components/dashboard/dosen/SupervisedStudentsCard';
import { UpcomingGuidanceClassesCard } from '@/components/dashboard/dosen/UpcomingGuidanceClassesCard';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem, DatabaseNotification, User } from '@/types';
import { Logbook, Report } from '@/types/internship';
import { Head } from '@inertiajs/react';

// Define interfaces for upcomingClasses
interface Student { // This should match the Student interface in UpcomingGuidanceClassesCard
    id: number;
    name: string;
    // Add other relevant student properties if known
}

interface GuidanceClass { // This should match the GuidanceClass interface in UpcomingGuidanceClassesCard
    id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    location?: string;
    meeting_link?: string;
    students: Student[];
}

interface DosenDashboardProps {
    supervisedStudents: User[]; // Changed from any[]
    pendingLogbooks: Logbook[];
    pendingReports: Report[];
    upcomingClasses: GuidanceClass[]; // Changed from any[]
    counts: {
        total_advisees: number;
        active_internships: number;
        pending_logbooks: number;
        pending_reports: number;
        upcoming_classes: number;
    };
    notifications: DatabaseNotification[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dosen/dashboard',
    },
];

export default function DosenDashboard({
    supervisedStudents,
    pendingLogbooks,
    pendingReports,
    upcomingClasses,
    counts,
    notifications,
}: DosenDashboardProps) {
    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Dosen" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4 md:p-6">
                <h1 className="text-2xl font-bold">Dashboard Dosen</h1>
                <p className="text-muted-foreground">Selamat datang di dashboard dosen. Berikut adalah ringkasan aktivitas dan tugas Anda.</p>

                {/* Top row - Analytics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <SupervisedStudentsCard students={supervisedStudents} totalAdvisees={counts.total_advisees} />
                    <PendingLogbooksCard logbooks={pendingLogbooks} totalPending={counts.pending_logbooks} />
                    <PendingReportsCard reports={pendingReports} totalPending={counts.pending_reports} />
                </div>

                {/* Bottom row - Additional info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <UpcomingGuidanceClassesCard classes={upcomingClasses} totalUpcoming={counts.upcoming_classes} />
                    <QuickActionsCard />
                    <NotificationSummaryCard notifications={notifications} />
                </div>
            </div>
        </FrontLayout>
    );
}
