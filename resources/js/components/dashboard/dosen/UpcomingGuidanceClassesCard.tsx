import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { Button } from '../../ui/button';

interface Student {
    id: number;
    name: string;
    // Add other relevant student properties if known
}

interface GuidanceClass {
    id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    location?: string;
    meeting_link?: string;
    students: Student[];
}

interface UpcomingGuidanceClassesCardProps {
    classes: GuidanceClass[];
    totalUpcoming: number;
}

export function UpcomingGuidanceClassesCard({ classes, totalUpcoming }: UpcomingGuidanceClassesCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kelas Bimbingan Mendatang</CardTitle>
                <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalUpcoming}</div>
                <p className="text-muted-foreground text-xs">Total Kelas Bimbingan Mendatang</p>

                <div className="mt-4 space-y-3">
                    {classes.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Tidak ada kelas bimbingan mendatang.</p>
                    ) : (
                        classes.map((guidanceClass) => (
                            <div key={guidanceClass.id} className="flex flex-col space-y-1 rounded-md border p-3 shadow-sm">
                                <p className="text-sm font-medium">{guidanceClass.title}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground text-xs">
                                        {new Date(guidanceClass.start_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {new Date(guidanceClass.start_date).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <p className="text-xs">
                                    {guidanceClass.location || guidanceClass.meeting_link ? (
                                        <>Lokasi: {guidanceClass.location || 'Online'}</>
                                    ) : (
                                        'Lokasi belum ditentukan'
                                    )}
                                </p>
                                <p className="text-xs">{guidanceClass.students.length} mahasiswa terdaftar</p>
                                <Link
                                    href={route('front.internships.guidance-classes.show', { id: guidanceClass.id })}
                                    className="text-primary text-xs hover:underline"
                                >
                                    Lihat Detail
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {classes.length > 0 && totalUpcoming > classes.length && (
                    <div className="mt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href={route('front.internships.guidance-classes.index')}>Lihat Semua Kelas</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
