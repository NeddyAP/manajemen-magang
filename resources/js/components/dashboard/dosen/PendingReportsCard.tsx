import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Report } from '@/types/internship';
import { Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Button } from '../../ui/button';

interface PendingReportsCardProps {
    reports: Report[];
    totalPending: number;
}

export function PendingReportsCard({ reports, totalPending }: PendingReportsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Laporan Menunggu Evaluasi</CardTitle>
                <FileText className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalPending}</div>
                <p className="text-muted-foreground text-xs">Total Laporan Belum Dievaluasi</p>

                <div className="mt-4 space-y-3">
                    {reports.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Tidak ada laporan yang perlu dievaluasi.</p>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="flex flex-col space-y-1 rounded-md border p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{report.user?.name}</p>
                                    <span className="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Menunggu</span>
                                </div>
                                <p className="text-muted-foreground text-xs">{report.internship?.company_name}</p>
                                <p className="text-xs font-medium">{report.title}</p>
                                <p className="text-muted-foreground text-xs">
                                    Dikirim: {new Date(report.created_at || '').toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                </p>
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

                {reports.length > 0 && totalPending > reports.length && (
                    <div className="mt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href={route('front.internships.reports.intern-list')}>Lihat Semua Laporan</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
