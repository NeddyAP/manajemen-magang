import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Calendar, ClipboardList, FileText, Lightbulb, Users } from 'lucide-react';

export function QuickActionsCard() {
    const actions = [
        {
            title: 'Kelola Mahasiswa',
            description: 'Lihat dan kelola mahasiswa bimbingan',
            icon: <Users className="h-5 w-5" />,
            href: route('front.internships.index'),
        },
        {
            title: 'Review Logbook',
            description: 'Review logbook mahasiswa bimbingan',
            icon: <ClipboardList className="h-5 w-5" />,
            href: route('front.internships.logbooks.intern-list'),
        },
        {
            title: 'Evaluasi Laporan',
            description: 'Evaluasi laporan mahasiswa bimbingan',
            icon: <FileText className="h-5 w-5" />,
            href: route('front.internships.reports.intern-list'),
        },
        {
            title: 'Buat Kelas Bimbingan',
            description: 'Buat kelas bimbingan baru',
            icon: <Calendar className="h-5 w-5" />,
            href: route('front.internships.guidance-classes.create'),
        },
        {
            title: 'Lihat Panduan',
            description: 'Lihat panduan penggunaan sistem',
            icon: <Lightbulb className="h-5 w-5" />,
            href: route('tutorials.index'),
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Akses Cepat</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {actions.map((action, index) => (
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
