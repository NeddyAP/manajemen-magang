import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardList, FileText, UserIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
];

interface User {
    role: string;
}

interface PageProps {
    auth: {
        user: User;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

interface CardItem {
    id: string;
    title: string;
    description: string;
    content: string;
    icon: React.ReactNode;
    route: string;
    buttonText: string;
    buttonVariant: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
    showOnlyFor?: string[];
}

export default function InternshipsIndex() {
    const { auth } = usePage<PageProps>().props;
    const role = auth.role;
    const isMahasiswa = role === 'mahasiswa';
    const isDosen = role === 'dosen';
    const cards: CardItem[] = [
        {
            id: 'apply',
            title: 'Aplikasi Magang',
            description: 'Ajukan program magang',
            content: 'Kirim aplikasi magang Anda dengan dokumen dan informasi yang diperlukan',
            icon: <UserIcon className="text-primary h-6 w-6" />,
            route: route('front.internships.applicants.create'),
            buttonText: 'Ajukan Sekarang',
            buttonVariant: 'default',
            showOnlyFor: ['mahasiswa'],
        },
        {
            id: 'my-applications',
            title: 'Aplikasi Saya',
            description: 'Lihat aplikasi magang Anda',
            content: 'Periksa status aplikasi Anda dan kelola progres magang Anda',
            icon: <UserIcon className="text-primary h-6 w-6" />,
            route: route('front.internships.applicants.index'),
            buttonText: 'Lihat Aplikasi',
            buttonVariant: 'outline',
        },
        {
            id: 'logbooks',
            title: 'Logbook Magang',
            description: 'Kelola logbook magang Anda',
            content: 'Catat dan dokumentasikan aktivitas magang Anda setiap hari',
            icon: <BookOpen className="text-primary h-6 w-6" />,
            route: route('front.internships.logbooks.intern-list'),
            buttonText: 'Pilih Magang',
            buttonVariant: 'outline',
        },
        {
            id: 'reports',
            title: 'Laporan Magang',
            description: 'Kelola laporan akhir magang Anda',
            content: 'Unggah, perbarui, dan lihat status laporan akhir magang Anda.',
            icon: <FileText className="text-primary h-6 w-6" />,
            route: route('front.internships.reports.intern-list'),
            buttonText: 'Pilih Magang',
            buttonVariant: 'outline',
        },
        {
            id: 'classes',
            title: 'Kelas Bimbingan',
            description: 'Kelas dan kehadiran bimbingan',
            content: 'Lihat jadwal kelas bimbingan, rekam kehadiran, dan ikuti bimbingan dengan dosen.',
            icon: <ClipboardList className="text-primary h-6 w-6" />,
            route: route('front.internships.guidance-classes.index'),
            buttonText: 'Lihat Kelas',
            buttonVariant: 'outline',
        },
    ];

    // Filter cards based on user role
    const filteredCards = cards.filter((card) => {
        if (!card.showOnlyFor) return true;
        if (isMahasiswa && card.showOnlyFor.includes('mahasiswa')) return true;
        if (isDosen && card.showOnlyFor.includes('dosen')) return true;
        return !card.showOnlyFor.length;
    });

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Magang" />
            <div className="flex h-full min-h-min flex-1 flex-col gap-4 p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative container mx-auto max-w-7xl flex-1 overflow-hidden rounded-xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Program Magang</h1>
                        <p className="text-muted-foreground">Kelola aplikasi dan progres magang Anda</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCards.map((card) => (
                            <Card key={card.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{card.title}</CardTitle>
                                        {card.icon}
                                    </div>
                                    <CardDescription>{card.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-sm">{card.content}</p>
                                    <Button asChild variant={card.buttonVariant}>
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
