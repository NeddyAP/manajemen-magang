import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { type Internship, type Report } from '@/types/internship';
import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { columns, initialColumnVisibility } from './components/column';
import { StatusFilter } from './components/filters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Laporan',
        href: route('front.internships.reports.intern-list'),
    },
    {
        title: 'Detail Laporan',
        href: '#',
    },
];

interface PageProps {
    internship: Internship;
    reports: Report[];
    meta: TableMeta;
}

interface TableMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

export default function ReportsIndex({ internship, reports, meta }: PageProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    useEffect(() => {
        const url = new URL(window.location.href);
        const status = url.searchParams.get('status');
        if (status) {
            setSelectedStatus(status);
        }
    }, []);

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        const query = status ? { status } : {};
        router.get(`/internships/reports/${internship.id}`, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    if (!internship.start_date || !internship.end_date) return 'Tanggal magang tidak valid';

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Magang" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Laporan Magang</h1>
                                <p className="text-muted-foreground">
                                    {internship.company_name} - {internship.type}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Periode: {format(parseISO(internship.start_date), 'dd MMMM yyyy', { locale: id })} -{' '}
                                    {format(parseISO(internship.end_date), 'dd MMMM yyyy', { locale: id })}
                                </p>
                            </div>
                            <Button asChild>
                                <Link href={route('front.internships.reports.create', internship.id)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Laporan
                                </Link>
                            </Button>
                        </div>

                        <DataTable
                            meta={meta}
                            columns={columns}
                            data={reports}
                            filter={<StatusFilter value={selectedStatus} onChange={handleStatusChange} />}
                            initialColumnVisibility={initialColumnVisibility}
                        />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
