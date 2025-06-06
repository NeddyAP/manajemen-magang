import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Lecturer, Role } from '@/types/user';
import { Head } from '@inertiajs/react';
import UserForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengguna',
        href: '/admin/users',
    },
    {
        title: 'Tambah User',
        href: '/admin/users/create',
    },
];
interface Props {
    roles: Role[];
    lecturers: Lecturer[];
}

export default function CreateUser({ roles, lecturers }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Pengguna" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Buat Pengguna</h1>
                    </div>

                    <UserForm roles={roles} lecturers={lecturers} mode="create" />
                </div>
            </div>
        </AppLayout>
    );
}
