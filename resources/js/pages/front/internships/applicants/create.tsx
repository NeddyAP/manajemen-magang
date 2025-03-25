import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import InternshipForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Ajukan Magang',
        href: route('front.internships.applicants.create'),
    },
];

export default function CreateInternshipApplication() {
    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajukan Magang" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Ajukan Magang</h1>
                        <p className="text-muted-foreground">Kirim aplikasi magang Anda dengan detail yang diperlukan</p>
                    </div>

                    <InternshipForm mode="create" />
                </div>
            </div>
        </FrontLayout>
    );
}
