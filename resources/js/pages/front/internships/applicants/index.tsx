import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import FrontLayout from '@/layouts/front-layout';
import { TableMeta, type BreadcrumbItem } from '@/types';
import { Internship, InternshipStats } from '@/types/internship'; // Import InternshipStats
import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { columns, initialColumnVisibility } from './components/column';
import { StatusFilter, TypeFilter } from './components/filters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Aplikasi Saya',
        href: route('front.internships.applicants.index'),
    },
];

interface InternshipsProps {
    internships: Internship[];
    stats: InternshipStats; // Add stats prop
    meta: TableMeta;
}

export default function Applicants({ internships, stats, meta }: InternshipsProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');

    // Initialize filters from URL on mount
    useEffect(() => {
        const url = new URL(window.location.href);
        const status = url.searchParams.get('status');
        const type = url.searchParams.get('type');

        if (status) {
            setSelectedStatus(status);
        }
        if (type) {
            setSelectedType(type);
        }
    }, []);

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);

        // Build query object
        const query: Record<string, string> = {};
        if (status) query.status = status;
        if (selectedType) query.type = selectedType;

        router.get(route('front.internships.applicants.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);

        // Build query object
        const query: Record<string, string> = {};
        if (selectedStatus) query.status = selectedStatus;
        if (type) query.type = type;

        router.get(route('front.internships.applicants.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Permohonan Magang" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Analytics Cards */}
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Aplikasi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total ?? 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.waiting ?? 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Diterima</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.accepted ?? 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.rejected ?? 0}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Data Table Section */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[60vh] flex-1 overflow-hidden rounded-xl border p-4 md:min-h-min">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex gap-2">
                                <StatusFilter value={selectedStatus} onChange={handleStatusChange} />
                                <TypeFilter value={selectedType} onChange={handleTypeChange} />
                            </div>
                            <Button>
                                <Link href={route('front.internships.applicants.create')} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Ajukan Magang
                                </Link>
                            </Button>
                        </div>
                        <DataTable
                            className="inset-0 size-full"
                            columns={columns}
                            data={internships}
                            filters={[
                                { id: 'status', value: selectedStatus },
                                { id: 'type', value: selectedType },
                            ]}
                            meta={meta}
                            deleteRoute={route('front.internships.applicants.destroy.bulk')}
                            initialColumnVisibility={initialColumnVisibility}
                        />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
