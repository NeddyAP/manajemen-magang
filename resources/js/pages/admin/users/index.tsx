import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DataTable } from '../../../components/data-table/data-table';
import { columns, User } from './components/column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
];

interface TableMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

interface UsersProps {
    users: User[];
    meta: TableMeta;
}

export default function Users({ users, meta }: UsersProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        {<PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />}
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <DataTable className="inset-0 size-full" columns={columns} data={users} meta={meta} />
                </div>
            </div>
        </AppLayout>
    );
}
