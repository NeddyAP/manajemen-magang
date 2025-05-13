import LogbookAnalytics from '@/components/admin/analytics/sections/LogbookAnalytics';
import LogbookRecentAnalytics from '@/components/admin/analytics/sections/LogbookRecentAnalytics';
import LogbookStatusAnalytics from '@/components/admin/analytics/sections/LogbookStatusAnalytics';
import { DataTable } from '@/components/data-table/data-table';
import AppLayout from '@/layouts/app-layout';
import { TableMeta, type BreadcrumbItem } from '@/types';
import { Logbook } from '@/types/internship';
import { Head } from '@inertiajs/react';
import { columns, initialColumnVisibility } from './components/column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Logbook',
        href: '/admin/logbooks',
    },
];

interface LogbookProps {
    logbooks: Logbook[];
    meta: TableMeta;
}

export default function Logbooks({ logbooks, meta }: LogbookProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logbook" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <LogbookAnalytics />
                    <LogbookStatusAnalytics />
                    <LogbookRecentAnalytics />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <DataTable
                        className="inset-0 size-full"
                        columns={columns}
                        data={logbooks}
                        meta={meta}
                        deleteRoute={route('admin.logbooks.destroy.bulk')}
                        initialColumnVisibility={initialColumnVisibility}
                        searchPlaceholder="Cari logbook berdasarkan nama mahasiswa, aktivitas, catatan..."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
