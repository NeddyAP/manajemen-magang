import { NotificationSummaryCard } from '@/components/dashboard/NotificationSummaryCard';
import { AdvisorInfoCard } from '@/components/dashboard/mahasiswa/AdvisorInfoCard';
import { InternshipStatusCard } from '@/components/dashboard/mahasiswa/InternshipStatusCard';
import { QuickActionsCard } from '@/components/dashboard/mahasiswa/QuickActionsCard';
import { RecentLogbooksCard } from '@/components/dashboard/mahasiswa/RecentLogbooksCard';
import { ReportStatusCard } from '@/components/dashboard/mahasiswa/ReportStatusCard';
import { UpcomingGuidanceClassesCard } from '@/components/dashboard/mahasiswa/UpcomingGuidanceClassesCard';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem, DatabaseNotification, User } from '@/types';
import { Internship, Logbook, Report } from '@/types/internship';
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

interface MahasiswaDashboardProps {
    internships: Internship[];
    activeInternship: Internship | null;
    recentLogbooks: Logbook[];
    reports: Report[];
    upcomingClasses: GuidanceClass[]; // Changed from any[]
    counts: {
        waiting_applications: number;
        accepted_internships: number;
        rejected_internships: number;
        total_logbooks: number;
        pending_reports: number;
        approved_reports: number;
        upcoming_classes: number;
    };
    notifications: DatabaseNotification[];
    advisor: User | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/mahasiswa/dashboard',
    },
];

export default function MahasiswaDashboard({
    internships,
    activeInternship,
    recentLogbooks,
    reports,
    upcomingClasses,
    counts,
    notifications,
    advisor,
}: MahasiswaDashboardProps) {
    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Mahasiswa" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4 md:p-6">
                <h1 className="text-2xl font-bold">Dashboard Mahasiswa</h1>
                <p className="text-muted-foreground">
                    Selamat datang di dashboard mahasiswa. Berikut adalah ringkasan aktivitas dan status magang Anda.
                </p>

                {/* Top row - Main info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <InternshipStatusCard internships={internships} counts={counts} />
                    <RecentLogbooksCard logbooks={recentLogbooks} activeInternship={activeInternship} totalLogbooks={counts.total_logbooks} />
                    <ReportStatusCard
                        reports={reports}
                        activeInternship={activeInternship}
                        counts={{
                            pending_reports: counts.pending_reports,
                            approved_reports: counts.approved_reports,
                        }}
                    />
                </div>

                {/* Bottom row - Additional info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <UpcomingGuidanceClassesCard classes={upcomingClasses} totalUpcoming={counts.upcoming_classes} />
                    <QuickActionsCard activeInternship={activeInternship} hasAdvisor={!!advisor} />
                    <div className="grid grid-cols-1 gap-4">
                        <AdvisorInfoCard advisor={advisor} />
                        <NotificationSummaryCard notifications={notifications} />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
