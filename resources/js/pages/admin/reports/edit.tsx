import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Report } from '@/types/internship';
import { Head } from '@inertiajs/react';
import ReportForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Laporan',
        href: '/admin/reports',
    },
    {
        title: 'Detail Laporan',
        href: '/admin/reports/{id}',
    },
];

interface Props {
    report: Report;
}

export default function EditReport({ report }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Laporan: ${report.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        {/* backbutton */}
                        <a href={route('admin.reports.index')} className="text-blue-500 hover:underline">
                            {' '}
                            Kembali
                        </a>
                        <h1 className="text-2xl font-bold">Detail Laporan: {report.title}</h1>
                    </div>

                    <ReportForm report={report} />
                </div>
            </div>
        </AppLayout>
    );
}
