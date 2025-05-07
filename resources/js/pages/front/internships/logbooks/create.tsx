import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { Internship } from '@/types/internship';
import { Head } from '@inertiajs/react';
import LogbookForm from './components/form'; // Import LogbookForm

interface PageProps {
    internship: Internship;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    // Breadcrumb href will be updated dynamically below
    {
        title: 'Logbook',
        href: '#', // Placeholder, will be set dynamically
    },
    {
        title: 'Tambah Logbook',
        href: '#',
    },
]; // Add missing closing bracket

export default function LogbookCreate({ internship }: PageProps) {
    // Update breadcrumb dynamically
    const dynamicBreadcrumbs = breadcrumbs.map((item) => {
        if (item.title === 'Logbook') {
            return { ...item, href: route('front.internships.logbooks.index', internship.id) };
        }
        return item;
    });

    return (
        <FrontLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title="Tambah Logbook" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">Tambah Logbook</h1>
                            <p className="text-muted-foreground">
                                {internship.company_name} - {internship.type}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Periode:{' '}
                                {internship.start_date
                                    ? new Date(internship.start_date).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : 'Belum ditentukan'}{' '}
                                -{' '}
                                {internship.end_date
                                    ? new Date(internship.end_date).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : 'Belum ditentukan'}
                            </p>
                        </div>

                        {/* Use the reusable form component */}
                        {internship.id ? (
                            <LogbookForm mode="create" internshipId={internship.id} />
                        ) : (
                            <div className="text-center text-red-500">ID Magang tidak valid</div>
                        )}
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
