import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import InternshipForm from './components/form';
import AppLayout from '@/layouts/app-layout';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Internship {
    id: number;
    user_id: number;
    lecturer_id?: number;
    type: 'kkl' | 'kkn';
    application_file: string;
    company_name: string;
    company_address: string;
    start_date: string;
    end_date: string;
    status: 'waiting' | 'accepted' | 'rejected';
    progress: string;
    created_at: string;
    updated_at: string;
    user?: User;
    lecturer?: User;
}

interface Props {
    internship: Internship;
    students: User[];
    lecturers: User[];
}

export default function EditInternship({ internship, students, lecturers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Internships',
            href: route('admin.internships.index'),
        },
        {
            title: 'Edit Internship',
            href: route('admin.internships.edit', internship.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Internship" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Internship</h1>
                        <p className="text-muted-foreground">Update internship details and status</p>
                    </div>

                    <InternshipForm mode="edit" internship={internship} students={students} lecturers={lecturers} />
                </div>
            </div>
        </AppLayout>
    );
}
