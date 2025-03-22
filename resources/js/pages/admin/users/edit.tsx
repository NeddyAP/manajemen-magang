import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Role, User } from '@/types/user';
import UserForm from './components/form';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
    {
        title: 'Edit User',
        href: '/admin/user/{id}/edit',
    },
];
interface Props {
    roles: Role[];
    user: User;
}

export default function EditUser({ roles, user }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User: ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit User: {user.name}</h1>
                    </div>

                    <UserForm roles={roles} user={user} mode="edit" />
                </div>
            </div>
        </AppLayout>
    );
}
