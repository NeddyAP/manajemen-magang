import InternshipAnalytics from '@/components/admin/analytics/sections/InternshipAnalytics';
import InternshipStatusAnalytics from '@/components/admin/analytics/sections/InternshipStatusAnalytics';
import InternshipTypeAnalytics from '@/components/admin/analytics/sections/InternshipTypeAnalytics';
import { DataTable } from '@/components/data-table/data-table';
import AppLayout from '@/layouts/app-layout';
import { TableMeta, type BreadcrumbItem } from '@/types';
import { Internship } from '@/types/internship';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
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
    const pendingRequestRef = useRef<NodeJS.Timeout | null>(null);

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
        updateFilters({ status, type: selectedType });
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        updateFilters({ status: selectedStatus, type });
    };

    const updateFilters = (filters: Record<string, string>) => {
        // Cancel any pending requests
        if (pendingRequestRef.current) {
            clearTimeout(pendingRequestRef.current);
            pendingRequestRef.current = null;
        }

        // Build query object with only non-empty values
        const query: Record<string, string> = {};

        // Preserve existing search term if present
        const url = new URL(window.location.href);
        const search = url.searchParams.get('search');
        if (search) {
            query.search = search;
        }

        // Add selected filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                query[key] = value;
            }
        });

        // Navigate with the updated filters after a small delay
        pendingRequestRef.current = setTimeout(() => {
            router.get(route('admin.internships.index'), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['internships', 'meta', 'errors'],
            });
            pendingRequestRef.current = null;
        }, 100);
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (pendingRequestRef.current) {
                clearTimeout(pendingRequestRef.current);
                pendingRequestRef.current = null;
            }
        };
    }, []);

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
                        <div className="flex flex-wrap gap-2">
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
                        searchPlaceholder="Cari nama, perusahaan, email, status, dll..."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
