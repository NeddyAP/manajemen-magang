import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Internship, Report } from '@/types/internship';
import { Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Button } from '../../ui/button';

interface ReportStatusCardProps {
    reports: Report[];
    activeInternship: Internship | null;
    counts: {
        pending_reports: number;
        approved_reports: number;
    };
}

export function ReportStatusCard({ reports, activeInternship, counts }: ReportStatusCardProps) {
    // Helper function to get status badge
    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'pending':
                return <span className="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Menunggu</span>;
            case 'approved':
                return <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Disetujui</span>;
            case 'rejected':
                return <span className="rounded bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Ditolak</span>;
            default:
                return <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">Tidak Diketahui</span>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Laporan</CardTitle>
                <FileText className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                        <div className="text-2xl font-bold">{counts.pending_reports}</div>
                        <p className="text-muted-foreground text-xs">Menunggu</p>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{counts.approved_reports}</div>
                        <p className="text-muted-foreground text-xs">Disetujui</p>
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    {!activeInternship ? (
                        <p className="text-muted-foreground text-sm">Anda belum memiliki magang aktif.</p>
                    ) : reports.length === 0 ? (
                        <div className="rounded-md border p-3 text-center">
                            <p className="text-muted-foreground text-sm">Anda belum mengupload laporan.</p>
                            <Button asChild variant="outline" className="mt-2">
                                <Link href={route('front.internships.reports.create', { internship: activeInternship.id })}>Upload Laporan</Link>
                            </Button>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="flex flex-col space-y-1 rounded-md border p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{report.title}</p>
                                    {getStatusBadge(report.status)}
                                </div>
                                <p className="text-muted-foreground text-xs">{report.internship?.company_name}</p>
                                <p className="text-muted-foreground text-xs">
                                    Dikirim: {new Date(report.created_at || '').toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                </p>
                                {report.reviewer_notes && <p className="line-clamp-1 text-xs italic">Catatan: {report.reviewer_notes}</p>}
                                <Link
                                    href={route('front.internships.reports.index', { internship: report.internship_id })}
                                    className="text-primary text-xs hover:underline"
                                >
                                    Lihat Detail
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {activeInternship && reports.length > 0 && (
                    <div className="mt-4 flex space-x-2">
                        <Button asChild variant="outline" className="flex-1">
                            <Link href={route('front.internships.reports.index', { internship: activeInternship.id })}>Lihat Semua</Link>
                        </Button>
                        <Button asChild variant="default" className="flex-1">
                            <Link href={route('front.internships.reports.create', { internship: activeInternship.id })}>Upload Baru</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
