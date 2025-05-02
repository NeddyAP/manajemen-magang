import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { type Internship } from '@/types/internship';
import { Head } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import ReportForm from './components/form';

interface PageProps {
    internship: Internship;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Laporan',
        href: '#',
    },
    {
        title: 'Tambah Laporan',
        href: '#',
    },
];

export default function ReportCreate({ internship }: PageProps) {
    const startDate = parseISO(internship.start_date);
    const endDate = parseISO(internship.end_date);

    const dynamicBreadcrumbs = breadcrumbs.map((item) => {
        if (item.title === 'Laporan') {
            return { ...item, href: route('front.internships.reports.index', internship.id) };
        }
        return item;
    });

    return (
        <FrontLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title="Tambah Laporan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">Tambah Laporan Magang</h1>
                            <p className="text-muted-foreground">
                                {internship.company_name} - {internship.type}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Periode: {format(startDate, 'dd MMMM yyyy, HH:mm', { locale: id })} -{' '}
                                {format(endDate, 'dd MMMM yyyy, HH:mm', { locale: id })}
                            </p>
                        </div>

                        <ReportForm mode="create" internshipId={internship.id} />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
