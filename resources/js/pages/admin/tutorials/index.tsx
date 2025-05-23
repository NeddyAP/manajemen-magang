import TutorialAnalytics from '@/components/admin/analytics/sections/TutorialAnalytics';
import TutorialInactiveAnalytics from '@/components/admin/analytics/sections/TutorialInactiveAnalytics';
import TutorialRecentAnalytics from '@/components/admin/analytics/sections/TutorialRecentAnalytics';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { TableMeta, type BreadcrumbItem } from '@/types';
import { Tutorial } from '@/types/tutorial';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { columns, initialColumnVisibility } from './components/column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutorial',
        href: '/admin/tutorials',
    },
];

interface TutorialsProps {
    tutorials: Tutorial[];
    meta: TableMeta;
}

export default function Tutorials({ tutorials, meta }: TutorialsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tutorial" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <TutorialAnalytics />
                    <TutorialInactiveAnalytics />
                    <TutorialRecentAnalytics />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-4 flex items-center justify-end">
                        <Button>
                            <Link href={route('admin.tutorials.create')} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah Tutorial
                            </Link>
                        </Button>
                    </div>
                    <DataTable
                        className="inset-0 size-full"
                        columns={columns}
                        data={tutorials}
                        meta={meta}
                        deleteRoute={route('admin.tutorials.destroy.bulk')}
                        initialColumnVisibility={initialColumnVisibility}
                        searchPlaceholder="Cari tutorial berdasarkan judul, konten..."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
