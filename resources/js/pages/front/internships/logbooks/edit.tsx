import FrontLayout from '@/layouts/front-layout';
import { BreadcrumbItem } from '@/types'; // Import Logbook from types
import { Logbook } from '@/types/internship';
import { Head } from '@inertiajs/react';
import LogbookForm from './components/form';

// Correct breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Logbook',
        // Dynamically set href based on logbook data
        href: '#', // Placeholder, will be set dynamically
    },
    {
        title: 'Edit Logbook',
        href: '#', // Current page
    },
];

interface Props {
    logbook: Logbook;
}

// Rename component
export default function LogbookEdit({ logbook }: Props) {
    // Update breadcrumb dynamically
    const dynamicBreadcrumbs = breadcrumbs.map((item) => {
        if (item.title === 'Logbook') {
            return { ...item, href: route('front.internships.logbooks.index', logbook.internship_id) };
        }
        return item;
    });

    return (
        <FrontLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`Edit Logbook: ${logbook.id}`} />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold">Edit Logbook</h1>
                        </div>

                        {/* Pass internshipId to LogbookForm */}
                        {logbook.internship_id ? (
                            <LogbookForm logbook={logbook} mode="edit" internshipId={logbook.internship_id} />
                        ) : (
                            <div className="text-center text-red-500">ID Magang tidak valid</div>
                        )}
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
