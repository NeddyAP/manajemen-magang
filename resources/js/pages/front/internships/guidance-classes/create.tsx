import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FrontLayout from '@/layouts/front-layout';
import { type BreadcrumbItem } from '@/types';
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
        title: 'Buat Kelas',
        href: route('front.internships.guidance-classes.create'),
    },
];

export default function CreateGuidanceClass() {
    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Kelas Bimbingan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Buat Kelas Bimbingan</CardTitle>
                            <CardDescription>Lengkapi informasi untuk membuat kelas bimbingan baru</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GuidanceClassForm mode="create" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </FrontLayout>
    );
}
