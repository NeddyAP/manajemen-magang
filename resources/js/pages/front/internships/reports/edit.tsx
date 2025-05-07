import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { type Report } from '@/types/internship';
import { Head } from '@inertiajs/react';
import ReportForm from './components/form';

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
        title: 'Edit Laporan',
        href: '#',
    },
];

interface PageProps {
    report: Report;
    internship: { id: number };
}

export default function ReportEdit({ report }: PageProps) {
    const dynamicBreadcrumbs = breadcrumbs.map((item) => {
        if (item.title === 'Laporan') {
            return { ...item, href: route('front.internships.reports.index', report.internship_id) };
        }
        return item;
    });

    return (
        <FrontLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`Edit Laporan: ${report.title}`} />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">Edit Laporan Magang</h1>
                        </div>

                        <ReportForm report={report} mode="edit" internshipId={report.internship_id} />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
