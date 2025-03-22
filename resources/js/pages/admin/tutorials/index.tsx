import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { columns, initialColumnVisibility } from './components/column';
import { User } from '@/types/user';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutorial',
        href: '/admin/tutorials',
    },
];
export interface Tutorial {
    id?: number;
    title: string;
    content: string;
    file_name: string;
    file_path: string;
    access_level: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

interface TableMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

interface TutorialsProps {
    tutorials: Tutorial[];
    meta: TableMeta;
}

export default function Tutorials({ tutorials, meta }: TutorialsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tutorial" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
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
                    />
                </div>
            </div>
        </AppLayout>
    );
}
