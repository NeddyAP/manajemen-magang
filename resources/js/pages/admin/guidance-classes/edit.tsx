import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { GuidanceClass } from '@/types/guidance-class';
import { User } from '@/types/user';
import { Head } from '@inertiajs/react';
import GuidanceClassForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelas Bimbingan',
        href: '/admin/guidance-classes',
    },
    {
        title: 'Edit Kelas',
        href: '/admin/guidance-classes/{id}/edit',
    },
];

interface Props {
    guidanceClass: GuidanceClass;
    lecturers: User[];
}

export default function EditGuidanceClass({ guidanceClass, lecturers }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Kelas: ${guidanceClass.title}`} />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Kelas: {guidanceClass.title}</h1>
                    </div>

                    <GuidanceClassForm lecturers={lecturers} guidanceClass={guidanceClass} mode="edit" />
                </div>
            </div>
        </AppLayout>
    );
}
