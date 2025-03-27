import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import InternshipForm from './components/form';

interface Internship {
    id: number;
    type: 'kkl' | 'kkn';
    application_file: string;
    company_name: string;
    company_address: string;
    start_date: string;
    end_date: string;
    status: 'waiting' | 'accepted' | 'rejected';
    status_message?: string | null;
    progress: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    internship: Internship;
}

export default function EditInternshipApplication({ internship }: Props) {
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">Detail Aplikasi Magang</h1>
                            <p className="text-muted-foreground">
                                {isEditable ? 'Perbarui detail aplikasi magang Anda' : 'Lihat detail aplikasi magang Anda'}
                            </p>
                        </div>

                        {internship.status === 'rejected' && internship.status_message && (
                            <div className="mb-6 rounded-md border border-red-500 bg-red-50 p-4 text-red-700">
                                <p className="font-medium">Alasan Penolakan:</p>
                                <p className="text-sm">{internship.status_message}</p>
                            </div>
                        )}

                        {internship.status === 'accepted' && (
                            <div className="mb-6 rounded-md border border-yellow-500 bg-yellow-50 p-4 text-yellow-700">
                                <p className="font-medium">Aplikasi ini tidak dapat diedit</p>
                                <p className="text-sm">Aplikasi yang telah disetujui tidak dapat diubah.</p>
                            </div>
                        )}

                        <InternshipForm mode="edit" internship={internship} disabled={!isEditable} />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
