import { CardView } from '@/components/internships/card-view';
import { DashboardView } from '@/components/internships/dashboard-view';
import { ViewToggle } from '@/components/view-toggle';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem, DatabaseNotification, User as FullUser } from '@/types'; // Renamed User to FullUser to avoid conflict
import { Internship, Logbook, Report } from '@/types/internship';
import { Head, router, usePage } from '@inertiajs/react';
import { Archive, BookOpen, FilePlus, FileText, LayoutDashboard, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
];

// This User interface is specific to the auth prop structure
interface User {
    role?: string;
}

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

interface PageProps {
    auth: {
        user: User; // This uses the local User interface for auth
        role?: string;
        permissions?: string[];
        [key: string]: unknown;
    };
    viewPreference: 'cards' | 'dashboard';
    userRole: string;
    dashboardData: {
        // Dosen data
        supervisedStudents?: FullUser[]; // Use FullUser from @/types
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
        activeInternship?: Internship | null;
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
        advisor?: FullUser | null; // Use FullUser from @/types

        // Common data
        notifications: DatabaseNotification[];
    };
    [key: string]: unknown;
}

interface CardItem {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    route: string;
    buttonText: string;
    buttonVariant: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
    requiredPermissions?: string[];
}

export default function InternshipsIndex() {
    const { auth, viewPreference: initialViewPreference, userRole, dashboardData } = usePage<PageProps>().props;
    const permissions = auth.permissions || [];
    const [viewPreference, setViewPreference] = useState<'cards' | 'dashboard'>(initialViewPreference || 'cards');

    // Update view preference when changed
    const handleViewChange = (view: 'cards' | 'dashboard') => {
        setViewPreference(view);

        // Update the cookie via a request parameter
        router.get(
            route('front.internships.index'),
            { view_preference: view },
            {
                preserveState: true,
                preserveScroll: true,
                only: [],
            },
        );
    };

    const cards: CardItem[] = [
        {
            id: 'admin-dashboard',
            title: 'Dashboard Admin',
            description: 'Kelola program magang',
            icon: <LayoutDashboard className="text-primary mb-4 h-12 w-12" />,
            route: route('admin.dashboard'),
            buttonText: 'Lihat Dashboard',
            buttonVariant: 'default',
            requiredPermissions: ['admin.dashboard.view'],
        },
        {
            id: 'apply',
            title: 'Ajukan Magang',
            description: 'Ajukan program magang',
            icon: <FilePlus className="text-primary mb-4 h-12 w-12" />,
            route: route('front.internships.applicants.create'),
            buttonText: 'Ajukan Sekarang',
            buttonVariant: 'default',
            requiredPermissions: ['internships.create'],
        },
        {
            id: 'my-applications',
            title: 'Aplikasi Magang',
            description: 'Lihat aplikasi magang',
            icon: <FileText className="text-primary mb-4 h-12 w-12" />,
            route: route('front.internships.applicants.index'),
            buttonText: 'Lihat Aplikasi',
            buttonVariant: 'outline',
            requiredPermissions: ['internships.view'],
        },
        {
            id: 'logbooks',
            title: 'Logbook Magang',
            description: 'Kelola logbook magang Anda',
            icon: <BookOpen className="text-primary mb-4 h-12 w-12" />,
            route: route('front.internships.logbooks.intern-list'),
            buttonText: 'Pilih Magang',
            buttonVariant: 'outline',
            requiredPermissions: ['logbooks.view'],
        },
        {
            id: 'reports',
            title: 'Laporan Magang',
            description: 'Kelola laporan akhir magang Anda',
            icon: <Archive className="text-primary mb-4 h-12 w-12" />,
            route: route('front.internships.reports.intern-list'),
            buttonText: 'Pilih Magang',
            buttonVariant: 'outline',
            requiredPermissions: ['reports.view'],
        },
        {
            id: 'classes',
            title: 'Kelas Bimbingan',
            description: 'Kelas dan kehadiran bimbingan',
            icon: <Users className="text-primary mb-4 h-12 w-12" />,
            route: route('front.internships.guidance-classes.index'),
            buttonText: 'Lihat Kelas',
            buttonVariant: 'outline',
            requiredPermissions: ['guidance-classes.view'],
        },
    ];

    // Filter cards based on user permissions
    const filteredCards = cards.filter((card) => {
        // If no permissions required, show the card
        if (!card.requiredPermissions || card.requiredPermissions.length === 0) {
            return true;
        }

        // Check if user has any of the required permissions
        return card.requiredPermissions.some((permission) => permissions.includes(permission));
    });

    // Only show the view toggle if the user is a dosen or mahasiswa
    const showViewToggle = userRole === 'dosen' || userRole === 'mahasiswa';

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Magang" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4 mt-5 mb-20">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative container mx-auto max-w-7xl flex-1 overflow-hidden rounded-xl">
                    {/* View Toggle */}
                    {showViewToggle && <ViewToggle view={viewPreference} onChange={handleViewChange} />}

                    {/* Render the appropriate view based on the user's preference */}
                    {viewPreference === 'cards' ? (
                        <CardView cards={filteredCards} />
                    ) : (
                        <DashboardView
                            userRole={userRole}
                            data={{ ...dashboardData, activeInternship: dashboardData.activeInternship ?? null, advisor: dashboardData.advisor ?? null }}
                        />
                    )}
                </div>
            </div>
        </FrontLayout>
    );
}
