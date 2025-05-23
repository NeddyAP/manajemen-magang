import { NotificationSummaryCard } from '@/components/dashboard/NotificationSummaryCard';
import { PendingLogbooksCard } from '@/components/dashboard/dosen/PendingLogbooksCard';
import { PendingReportsCard } from '@/components/dashboard/dosen/PendingReportsCard';
import { QuickActionsCard as DosenQuickActionsCard } from '@/components/dashboard/dosen/QuickActionsCard';
import { SupervisedStudentsCard } from '@/components/dashboard/dosen/SupervisedStudentsCard';
import { UpcomingGuidanceClassesCard as DosenUpcomingClassesCard } from '@/components/dashboard/dosen/UpcomingGuidanceClassesCard';
import { AdvisorInfoCard } from '@/components/dashboard/mahasiswa/AdvisorInfoCard';
import { InternshipStatusCard } from '@/components/dashboard/mahasiswa/InternshipStatusCard';
import { QuickActionsCard as MahasiswaQuickActionsCard } from '@/components/dashboard/mahasiswa/QuickActionsCard';
import { RecentLogbooksCard } from '@/components/dashboard/mahasiswa/RecentLogbooksCard';
import { ReportStatusCard } from '@/components/dashboard/mahasiswa/ReportStatusCard';
import { UpcomingGuidanceClassesCard as MahasiswaUpcomingClassesCard } from '@/components/dashboard/mahasiswa/UpcomingGuidanceClassesCard';
import { DatabaseNotification, User } from '@/types';
import { Internship, Logbook, Report } from '@/types/internship';

// Removed SupervisedStudent and Advisor interfaces as User type will be used directly.

interface StudentInClass {
    id: number;
    name: string;
    // Potentially other fields
}

interface UpcomingClass {
    id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    location?: string;
    meeting_link?: string;
    students: StudentInClass[];
}

interface DashboardViewProps {
    userRole: string;
    data: {
        // Dosen data
        supervisedStudents?: User[]; // Changed from SupervisedStudent[] to User[]
        pendingLogbooks?: Logbook[];
        pendingReports?: Report[];
        dosenUpcomingClasses?: UpcomingClass[];
        dosenCounts?: {
            total_advisees: number;
            active_internships: number;
            pending_logbooks: number;
            pending_reports: number;
            upcoming_classes: number;
        };

        // Mahasiswa data
        internships?: Internship[];
        activeInternship: Internship | null; // Removed undefined possibility
        recentLogbooks?: Logbook[];
        reports?: Report[];
        mahasiswaUpcomingClasses?: UpcomingClass[];
        mahasiswaCounts?: {
            waiting_applications: number;
            accepted_internships: number;
            rejected_internships: number;
            total_logbooks: number;
            pending_reports: number;
            approved_reports: number;
            upcoming_classes: number;
        };
        advisor: User | null; // Changed from Advisor | null to User | null

        // Common data
        notifications: DatabaseNotification[];
    };
}

export function DashboardView({ userRole, data }: DashboardViewProps) {
    if (userRole === 'dosen') {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Dashboard Dosen</h1>
                <p className="text-muted-foreground">Selamat datang di dashboard dosen. Berikut adalah ringkasan aktivitas dan tugas Anda.</p>

                {/* Top row - Additional info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <DosenUpcomingClassesCard classes={data.dosenUpcomingClasses || []} totalUpcoming={data.dosenCounts?.upcoming_classes || 0} />
                    <DosenQuickActionsCard />
                    <NotificationSummaryCard notifications={data.notifications} />
                </div>

                {/* Bottom row - Analytics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <SupervisedStudentsCard students={data.supervisedStudents || []} totalAdvisees={data.dosenCounts?.total_advisees || 0} />
                    <PendingLogbooksCard logbooks={data.pendingLogbooks || []} totalPending={data.dosenCounts?.pending_logbooks || 0} />
                    <PendingReportsCard reports={data.pendingReports || []} totalPending={data.dosenCounts?.pending_reports || 0} />
                </div>
            </div>
        );
    } else if (userRole === 'mahasiswa') {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Dashboard Mahasiswa</h1>
                <p className="text-muted-foreground">
                    Selamat datang di dashboard mahasiswa. Berikut adalah ringkasan aktivitas dan status magang Anda.
                </p>

                {/* Top row - Main info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <InternshipStatusCard
                        internships={data.internships || []}
                        counts={{
                            waiting_applications: data.mahasiswaCounts?.waiting_applications || 0,
                            accepted_internships: data.mahasiswaCounts?.accepted_internships || 0,
                            rejected_internships: data.mahasiswaCounts?.rejected_internships || 0,
                        }}
                    />
                    <RecentLogbooksCard
                        logbooks={data.recentLogbooks || []}
                        activeInternship={data.activeInternship}
                        totalLogbooks={data.mahasiswaCounts?.total_logbooks || 0}
                    />
                    <ReportStatusCard
                        reports={data.reports || []}
                        activeInternship={data.activeInternship}
                        counts={{
                            pending_reports: data.mahasiswaCounts?.pending_reports || 0,
                            approved_reports: data.mahasiswaCounts?.approved_reports || 0,
                        }}
                    />
                </div>

                {/* Bottom row - Additional info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <MahasiswaUpcomingClassesCard
                        classes={data.mahasiswaUpcomingClasses || []}
                        totalUpcoming={data.mahasiswaCounts?.upcoming_classes || 0}
                    />
                    <MahasiswaQuickActionsCard activeInternship={data.activeInternship} hasAdvisor={!!data.advisor} />
                    <div className="grid grid-cols-1 gap-4">
                        <AdvisorInfoCard advisor={data.advisor} />
                        <NotificationSummaryCard notifications={data.notifications} />
                    </div>
                </div>
            </div>
        );
    } else {
        // Default view for other roles
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Selamat datang di dashboard. Silakan pilih opsi dari menu di atas.</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <NotificationSummaryCard notifications={data.notifications} />
                </div>
            </div>
        );
    }
}
