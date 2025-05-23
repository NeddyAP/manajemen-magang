import GlobalVarAnalytics from '@/components/admin/analytics/sections/GlobalVarAnalytics';
import GlobalVarInactiveAnalytics from '@/components/admin/analytics/sections/GlobalVarInactiveAnalytics';
import GlobalVarRecentAnalytics from '@/components/admin/analytics/sections/GlobalVarRecentAnalytics';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { TableMeta, type BreadcrumbItem } from '@/types';
import { GlobalVariable } from '@/types/global-variable';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { columns, initialColumnVisibility } from './components/column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Global Variables',
        href: '/admin/global-variables',
    },
];

interface GlobalVariablesProps {
    globalVariables: GlobalVariable[];
    meta: TableMeta;
}

export default function GlobalVariables({ globalVariables, meta }: GlobalVariablesProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Global Variables" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <GlobalVarAnalytics />
                    <GlobalVarInactiveAnalytics />
                    <GlobalVarRecentAnalytics />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-4 flex items-center justify-end">
                        <Button>
                            <Link href={route('admin.global-variables.create')} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah Global Variable
                            </Link>
                        </Button>
                    </div>
                    <DataTable
                        className="inset-0 size-full"
                        columns={columns}
                        data={globalVariables}
                        meta={meta}
                        deleteRoute={route('admin.global-variables.destroy.bulk')}
                        initialColumnVisibility={initialColumnVisibility}
                        searchPlaceholder="Cari variabel berdasarkan key, value, deskripsi..."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
