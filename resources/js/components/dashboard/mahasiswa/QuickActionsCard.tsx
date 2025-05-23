import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Internship } from '@/types/internship';
import { Link } from '@inertiajs/react';
import { Briefcase, Calendar, ClipboardList, FileText, Lightbulb, User } from 'lucide-react';

interface QuickActionsCardProps {
    activeInternship: Internship | null;
    hasAdvisor: boolean;
}

export function QuickActionsCard({ activeInternship, hasAdvisor }: QuickActionsCardProps) {
    // Base actions that are always available
    const baseActions = [
        {
            title: 'Ajukan Magang',
            description: 'Ajukan permohonan magang baru',
            icon: <Briefcase className="h-5 w-5" />,
            href: route('front.internships.applicants.create'),
            show: !activeInternship,
        },
        {
            title: 'Pengajuan Saya',
            description: 'Lihat status pengajuan magang',
            icon: <Briefcase className="h-5 w-5" />,
            href: route('front.internships.applicants.index'),
            show: true,
        },
        {
            title: 'Lihat Panduan',
            description: 'Lihat panduan penggunaan sistem',
            icon: <Lightbulb className="h-5 w-5" />,
            href: route('tutorials.index'),
            show: true,
        },
        {
            title: 'Profil Saya',
            description: 'Lihat dan edit profil',
            icon: <User className="h-5 w-5" />,
            href: route('profile.edit'),
            show: true,
        },
    ];

    // Actions that are only available if there's an active internship
    const internshipActions = [
        {
            title: 'Buat Logbook',
            description: 'Catat aktivitas magang harian',
            icon: <ClipboardList className="h-5 w-5" />,
            href: activeInternship ? route('front.internships.logbooks.create', { internship: activeInternship.id }) : '#',
            show: !!activeInternship,
        },
        {
            title: 'Upload Laporan',
            description: 'Upload laporan magang',
            icon: <FileText className="h-5 w-5" />,
            href: activeInternship ? route('front.internships.reports.create', { internship: activeInternship.id }) : '#',
            show: !!activeInternship,
        },
        {
            title: 'Kelas Bimbingan',
            description: 'Lihat jadwal kelas bimbingan',
            icon: <Calendar className="h-5 w-5" />,
            href: route('front.internships.guidance-classes.index'),
            show: hasAdvisor,
        },
    ];

    // Combine and filter actions
    const allActions = [...baseActions, ...internshipActions].filter((action) => action.show);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Akses Cepat</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {allActions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className="hover:bg-muted/50 flex items-start space-x-3 rounded-md border p-3 transition-colors"
                        >
                            <div className="bg-primary/10 text-primary mt-0.5 rounded-md p-2">{action.icon}</div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">{action.title}</p>
                                <p className="text-muted-foreground text-xs">{action.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
