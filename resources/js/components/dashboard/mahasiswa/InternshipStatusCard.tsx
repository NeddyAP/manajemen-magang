import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Internship } from '@/types/internship';
import { Link } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';
import { Button } from '../../ui/button';

interface InternshipStatusCardProps {
    internships: Internship[];
    counts: {
        waiting_applications: number;
        accepted_internships: number;
        rejected_internships: number;
    };
}

export function InternshipStatusCard({ internships, counts }: InternshipStatusCardProps) {
    // Helper function to get status badge
    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'waiting':
                return <span className="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Menunggu</span>;
            case 'accepted':
                return <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Diterima</span>;
            case 'rejected':
                return <span className="rounded bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Ditolak</span>;
            default:
                return <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">Tidak Diketahui</span>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Magang</CardTitle>
                <Briefcase className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <div className="text-2xl font-bold">{counts.waiting_applications}</div>
                        <p className="text-muted-foreground text-xs">Menunggu</p>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{counts.accepted_internships}</div>
                        <p className="text-muted-foreground text-xs">Diterima</p>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{counts.rejected_internships}</div>
                        <p className="text-muted-foreground text-xs">Ditolak</p>
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    {internships.length === 0 ? (
                        <div className="rounded-md border p-3 text-center">
                            <p className="text-muted-foreground text-sm">Anda belum mengajukan magang.</p>
                            <Button asChild variant="outline" className="mt-2">
                                <Link href={route('front.internships.applicants.create')}>Ajukan Magang</Link>
                            </Button>
                        </div>
                    ) : (
                        internships.map((internship) => (
                            <div key={internship.id} className="flex flex-col space-y-1 rounded-md border p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{internship.company_name}</p>
                                    {getStatusBadge(internship.status)}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    {internship.type?.toUpperCase()} - {internship.company_address}
                                </p>
                                {internship.start_date && internship.end_date && (
                                    <p className="text-muted-foreground text-xs">
                                        {new Date(internship.start_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })} -{' '}
                                        {new Date(internship.end_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                    </p>
                                )}
                                {internship.status === 'accepted' && (
                                    <div className="mt-1 flex space-x-2">
                                        <Link
                                            href={route('front.internships.logbooks.index', { internship: internship.id })}
                                            className="text-primary text-xs hover:underline"
                                        >
                                            Logbook
                                        </Link>
                                        <Link
                                            href={route('front.internships.reports.index', { internship: internship.id })}
                                            className="text-primary text-xs hover:underline"
                                        >
                                            Laporan
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {internships.length > 0 && (
                    <div className="mt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href={route('front.internships.applicants.index')}>Lihat Semua Pengajuan</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
