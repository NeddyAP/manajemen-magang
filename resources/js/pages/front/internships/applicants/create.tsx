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
        title: 'Aplikasi Saya',
        href: route('front.internships.applicants.index'),
    },
    {
        title: 'Ajukan Magang',
        href: route('front.internships.applicants.create'),
    },
];

interface MahasiswaProfile {
    student_number: string;
}

interface CreateInternshipApplicationProps {
    mahasiswa_profile: MahasiswaProfile;
}

export default function CreateInternshipApplication({ mahasiswa_profile }: CreateInternshipApplicationProps) {
    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajukan Magang" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                        <InternshipForm mode="create" mahasiswa_profile={mahasiswa_profile} />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
