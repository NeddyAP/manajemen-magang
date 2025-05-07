import GuidanceAnalytics from '@/components/admin/analytics/sections/GuidanceAnalytics';
import GuidancePastAnalytics from '@/components/admin/analytics/sections/GuidancePastAnalytics';
import GuidanceUpcomingAnalytics from '@/components/admin/analytics/sections/GuidanceUpcomingAnalytics';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { GuidanceClass } from '@/types/guidance-class';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { column, initialColumnVisibility } from './components/column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelas Bimbingan',
        href: '/admin/guidance-classes',
    },
];

interface TableMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

interface Props {
    classes: GuidanceClass[];
    meta: TableMeta;
}

export default function GuidanceClasses({ classes, meta }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelas Bimbingan" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <GuidanceAnalytics />
                    <GuidanceUpcomingAnalytics />
                    <GuidancePastAnalytics />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-4 flex items-center justify-end">
                        <Button>
                            <Link href={route('admin.guidance-classes.create')} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah Kelas
                            </Link>
                        </Button>
                    </div>
                    <DataTable
                        className="inset-0 size-full"
                        columns={column}
                        data={classes}
                        meta={meta}
                        deleteRoute={route('admin.guidance-classes.destroy.bulk')}
                        initialColumnVisibility={initialColumnVisibility}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
