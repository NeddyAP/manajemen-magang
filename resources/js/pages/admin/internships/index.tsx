import InternshipAnalytics from '@/components/admin/analytics/sections/InternshipAnalytics';
import InternshipStatusAnalytics from '@/components/admin/analytics/sections/InternshipStatusAnalytics';
import InternshipTypeAnalytics from '@/components/admin/analytics/sections/InternshipTypeAnalytics';
import { DataTable } from '@/components/data-table/data-table';
import AppLayout from '@/layouts/app-layout';
import { TableMeta, type BreadcrumbItem } from '@/types';
import { Internship } from '@/types/internship';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { columns, initialColumnVisibility } from './components/column';
import { StatusFilter, TypeFilter } from './components/filters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: '/admin/internships',
    },
];

interface InternshipsProps {
    internships: Internship[];
    meta: TableMeta;
}

export default function Internships({ internships, meta }: InternshipsProps) {
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

        router.get(route('admin.internships.index'), query, {
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

        router.get(route('admin.internships.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Magang" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <InternshipAnalytics />
                    <InternshipStatusAnalytics />
                    <InternshipTypeAnalytics />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex gap-2">
                            <StatusFilter value={selectedStatus} onChange={handleStatusChange} />
                            <TypeFilter value={selectedType} onChange={handleTypeChange} />
                        </div>
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
                        deleteRoute={route('admin.internships.destroy.bulk')}
                        initialColumnVisibility={initialColumnVisibility}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
