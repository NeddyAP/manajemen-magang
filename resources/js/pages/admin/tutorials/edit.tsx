import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Tutorial } from '@/types/tutorial';
import { Head } from '@inertiajs/react';
import TutorialForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tutorial',
        href: '/admin/tutorials',
    },
    {
        title: 'Edit Tutorial',
        href: '/admin/tutorials/{id}/edit',
    },
];

interface Props {
    tutorial: Tutorial;
}

export default function EditTutorial({ tutorial }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Tutorial: ${tutorial.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Tutorial</h1>
                    </div>

                    <TutorialForm tutorial={tutorial} mode="edit" />
                </div>
            </div>
        </AppLayout>
    );
}
