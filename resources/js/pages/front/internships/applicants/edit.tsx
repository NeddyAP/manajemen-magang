import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Internship } from '@/types/internship';
import { Head } from '@inertiajs/react';
import InternshipForm from './components/form';

interface MahasiswaProfileData {
    student_number: string | null; // Allow null if student_number might not exist
}

interface Props {
    internship: Internship;
    mahasiswa_profile: MahasiswaProfileData; // Expect the simplified object
}

export default function EditInternshipApplication({ internship, mahasiswa_profile }: Props) {
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
            title: 'Edit Aplikasi',
            href: route('front.internships.applicants.edit', internship.id),
        },
    ];
    const isEditable = internship.status === 'waiting' || internship.status === 'rejected';

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Aplikasi Magang" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                        <InternshipForm
                            mode="edit"
                            internship={internship}
                            disabled={!isEditable}
                            mahasiswa_profile={mahasiswa_profile} // Pass the prop from controller
                        />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
