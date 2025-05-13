import UserActiveAnalytics from '@/components/admin/analytics/sections/UserActiveAnalytics';
import UserAnalytics from '@/components/admin/analytics/sections/UserAnalytics';
import UserRecentAnalytics from '@/components/admin/analytics/sections/UserRecentAnalytics';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { User, type BreadcrumbItem } from '@/types';
import { Role } from '@/types/user';
import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DataTable } from '../../../components/data-table/data-table';
import { columns, initialColumnVisibility } from './components/column';
import { RoleFilter } from './components/filters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengguna',
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
    const pendingRequestRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize filters from URL on mount
    useEffect(() => {
        const url = new URL(window.location.href);
        const role = url.searchParams.get('role');
        if (role) {
            setSelectedRole(role);
        }
    }, []);

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        updateFilters(role);
    };

    const updateFilters = (role: string) => {
        // Cancel any pending requests
        if (pendingRequestRef.current) {
            clearTimeout(pendingRequestRef.current);
            pendingRequestRef.current = null;
        }

        // Build query with only non-empty values
        const query: Record<string, string> = {};

        // Preserve existing search term if present
        const url = new URL(window.location.href);
        const search = url.searchParams.get('search');
        if (search) {
            query.search = search;
        }

        // Add role filter if set
        if (role) {
            query.role = role;
        }

        // Navigate with updated filters after a small delay
        pendingRequestRef.current = setTimeout(() => {
            router.get(route('admin.users.index'), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['users', 'meta', 'errors'],
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
            <Head title="Pengguna" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <UserAnalytics />
                    <UserActiveAnalytics />
                    <UserRecentAnalytics />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-4 flex items-center justify-end">
                        <Button>
                            <Link href={route('admin.users.create')} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah User
                            </Link>
                        </Button>
                    </div>
                    <DataTable
                        className="inset-0 size-full"
                        columns={columns}
                        data={users}
                        meta={meta}
                        filters={[{ id: 'role', value: selectedRole }]}
                        filter={<RoleFilter roles={meta.roles} value={selectedRole} onChange={handleRoleChange} />}
                        deleteRoute={route('admin.users.destroy.bulk')}
                        initialColumnVisibility={initialColumnVisibility}
                        searchPlaceholder="Cari pengguna berdasarkan nama, email..."
                    />
                </div>
            </div>
        </AppLayout>
    );
}
