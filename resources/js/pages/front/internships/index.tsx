import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Archive, BookOpen, FilePlus, FileText, LayoutDashboard, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
];

interface User {
    role?: string;
}

interface PageProps {
    auth: {
        user: User;
        role?: string;
        permissions?: string[];
        [key: string]: unknown;
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
    const { auth } = usePage<PageProps>().props;
    const permissions = auth.permissions || [];

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

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Magang" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative container mx-auto max-w-7xl flex-1 overflow-hidden rounded-xl">
                    <div className="mb-8 text-center">
                        <h1 className="mt-10 text-3xl font-bold tracking-tight">Program Magang</h1>
                        <p className="text-muted-foreground">Kelola semua kebutuhan program magang Anda di satu tempat.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredCards.map((card) => (
                            <Card key={card.id} className="flex flex-col text-center">
                                <CardHeader className="flex flex-col items-center pt-8">
                                    {card.icon}
                                    <CardTitle className="text-xl font-semibold">{card.title}</CardTitle>
                                    <CardDescription className="mt-1 text-sm">{card.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto flex flex-col items-center pb-8">
                                    {/* <p className="mb-4 text-sm">{card.content}</p> // Removed as per new design */}
                                    <Button asChild variant={card.buttonVariant} className="mt-4 w-full max-w-xs">
                                        <Link href={card.route}>{card.buttonText}</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
