import ReportAnalytics from '@/components/admin/analytics/sections/ReportAnalytics';
import ReportRecentAnalytics from '@/components/admin/analytics/sections/ReportRecentAnalytics';
import ReportStatusAnalytics from '@/components/admin/analytics/sections/ReportStatusAnalytics';
import { DataTable } from '@/components/data-table/data-table';
import AppLayout from '@/layouts/app-layout';
import { TableMeta, type BreadcrumbItem } from '@/types';
import { Report } from '@/types/internship';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { columns, initialColumnVisibility } from './components/column';
import { StatusFilter } from './components/filters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Laporan',
        href: '/admin/reports',
    },
];

interface ReportsProps {
    reports: Report[];
    meta: TableMeta;
}

export default function Reports({ reports, meta }: ReportsProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const pendingRequestRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize filters from URL on mount
    useEffect(() => {
        const url = new URL(window.location.href);
        const status = url.searchParams.get('status');

        if (status) {
            setSelectedStatus(status);
        }
    }, []);

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        updateFilters(status);
    };

    const updateFilters = (status: string) => {
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

        // Add status filter if set
        if (status) {
            query.status = status;
        }

        // Navigate with updated filters after a small delay
        pendingRequestRef.current = setTimeout(() => {
            router.get(route('admin.reports.index'), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['reports', 'meta', 'errors'],
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
            <Head title="Laporan" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <ReportAnalytics />
                    <ReportStatusAnalytics />
                    <ReportRecentAnalytics />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div>
                        <StatusFilter value={selectedStatus} onChange={handleStatusChange} />
                    </div>
                    <DataTable
                        className="inset-0 size-full"
                        columns={columns}
                        data={reports}
                        filters={[{ id: 'status', value: selectedStatus }]}
                        meta={meta}
                        deleteRoute={route('admin.reports.destroy.bulk')}
                        initialColumnVisibility={initialColumnVisibility}
                        searchPlaceholder="Cari laporan berdasarkan judul, mahasiswa, perusahaan..."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
