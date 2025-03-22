import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Role } from '@/types/user';
import UserForm from './components/form';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
    {
        title: 'Tambah User',
        href: '/admin/users/create',
    },
];
interface Props {
    roles: Role[];
}

export default function CreateUser({ roles }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Create User</h1>
                    </div>

                    <UserForm roles={roles} mode="create" />
                </div>
            </div>
        </AppLayout>
    );
}
