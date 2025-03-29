import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { User } from '@/types/user';
import { Head } from '@inertiajs/react';
import GuidanceClassForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelas Bimbingan',
        href: '/admin/guidance-classes',
    },
    {
        title: 'Tambah Kelas',
        href: '/admin/guidance-classes/create',
    },
];

interface Props {
    lecturers: User[];
}

export default function CreateGuidanceClass({ lecturers }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Kelas Bimbingan" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Buat Kelas Bimbingan</h1>
                    </div>

                    <GuidanceClassForm lecturers={lecturers} mode="create" />
                </div>
            </div>
        </AppLayout>
    );
}
