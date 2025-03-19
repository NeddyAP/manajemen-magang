import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { DataTable } from '../../../components/data-table/data-table';
import { columns, Role, User } from './components/column';
import { RoleFilter } from './components/filters';

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
    roles: Role[];
}

interface UsersProps {
    users: User[];
    meta: TableMeta;
}

export default function Users({ users, meta }: UsersProps) {
    const [selectedRole, setSelectedRole] = useState<string>('');

    useEffect(() => {
        const url = new URL(window.location.href);
        const role = url.searchParams.get('role');
        if (role) {
            setSelectedRole(role);
        }
    }, []);

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        const query = role ? { role } : {};
        router.get('/admin/users', query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

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
                    <DataTable
                        className="inset-0 size-full"
                        columns={columns}
                        data={users}
                        meta={meta}
                        filter={<RoleFilter roles={meta.roles} value={selectedRole} onChange={handleRoleChange} />}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
