import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Lecturer, Role, User } from '@/types/user';
import { Head } from '@inertiajs/react';
import UserForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengguna',
        href: '/admin/users',
    },
    {
        title: 'Edit Pengguna',
        href: `/admin/users/edit`,
    },
];
interface Props {
    roles: Role[];
    user: User;
    lecturers: Lecturer[];
}

export default function EditUser({ roles, user, lecturers }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User: ${user.name}`} />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Pengguna: {user.name}</h1>
                    </div>

                    <UserForm roles={roles} user={user} lecturers={lecturers} mode="edit" />
                </div>
            </div>
        </AppLayout>
    );
}
