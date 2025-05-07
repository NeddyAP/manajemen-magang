import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
import { GuidanceClass } from '@/types/guidance-class';
import { Head } from '@inertiajs/react';
import GuidanceClassForm from './components/form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Kelas Bimbingan',
        href: route('front.internships.guidance-classes.index'),
    },
    {
        title: 'Edit Kelas',
        href: '#',
    },
];

interface Props {
    guidanceClass: GuidanceClass;
}

export default function EditGuidanceClass({ guidanceClass }: Props) {
    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Kelas: ${guidanceClass.title}`} />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Kelas Bimbingan</CardTitle>
                            <CardDescription>Perbarui informasi kelas bimbingan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GuidanceClassForm mode="edit" guidanceClass={guidanceClass} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </FrontLayout>
    );
}
