import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Internship } from '@/types/internship';
import { Head } from '@inertiajs/react';
import InternshipForm from '../internships/components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: '/admin/internships',
    },
    {
        title: 'Ubah Magang',
        href: '/admin/internships/{id}/edit',
    },
];

interface Props {
    internship: Internship;
}

export default function EditInternship({ internship }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ubah Magang: ${internship.user?.name}`} />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Ubah Magang: {internship.user?.name}</h1>
                    </div>

                    <InternshipForm internship={internship} />
                </div>
            </div>
        </AppLayout>
    );
}
