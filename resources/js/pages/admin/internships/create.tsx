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

interface Props {
    students: User[];
    lecturers: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Internships',
        href: route('admin.internships.index'),
    },
    {
        title: 'Create Internship',
        href: route('admin.internships.create'),
    },
];

export default function CreateInternship({ students, lecturers }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Internship" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Create Internship</h1>
                        <p className="text-muted-foreground">Add a new internship for a student</p>
                    </div>

                    <InternshipForm mode="create" students={students} lecturers={lecturers} />
                </div>
            </div>
        </AppLayout>
    );
}
