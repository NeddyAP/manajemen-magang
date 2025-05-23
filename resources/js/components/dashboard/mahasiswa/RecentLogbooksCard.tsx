import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Internship, Logbook } from '@/types/internship';
import { Link } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { Button } from '../../ui/button';

interface RecentLogbooksCardProps {
    logbooks: Logbook[];
    activeInternship: Internship | null;
    totalLogbooks: number;
}

export function RecentLogbooksCard({ logbooks, activeInternship, totalLogbooks }: RecentLogbooksCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Logbook Terbaru</CardTitle>
                <ClipboardList className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalLogbooks}</div>
                <p className="text-muted-foreground text-xs">Total Logbook</p>

                <div className="mt-4 space-y-3">
                    {!activeInternship ? (
                        <p className="text-muted-foreground text-sm">Anda belum memiliki magang aktif.</p>
                    ) : logbooks.length === 0 ? (
                        <div className="rounded-md border p-3 text-center">
                            <p className="text-muted-foreground text-sm">Anda belum membuat logbook.</p>
                            <Button asChild variant="outline" className="mt-2">
                                <Link href={route('front.internships.logbooks.create', { internship: activeInternship.id })}>Buat Logbook</Link>
                            </Button>
                        </div>
                    ) : (
                        logbooks.map((logbook) => (
                            <div key={logbook.id} className="flex flex-col space-y-1 rounded-md border p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        {new Date(logbook.date || '').toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                    </p>
                                    {logbook.supervisor_notes ? (
                                        <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Disetujui</span>
                                    ) : (
                                        <span className="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Menunggu</span>
                                    )}
                                </div>
                                <p className="line-clamp-2 text-xs">{logbook.activities}</p>
                                {logbook.supervisor_notes && <p className="line-clamp-1 text-xs italic">Catatan: {logbook.supervisor_notes}</p>}
                                <Link
                                    href={route('front.internships.logbooks.index', { internship: logbook.internship_id })}
                                    className="text-primary text-xs hover:underline"
                                >
                                    Lihat Detail
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {activeInternship && logbooks.length > 0 && (
                    <div className="mt-4 flex space-x-2">
                        <Button asChild variant="outline" className="flex-1">
                            <Link href={route('front.internships.logbooks.index', { internship: activeInternship.id })}>Lihat Semua</Link>
                        </Button>
                        <Button asChild variant="default" className="flex-1">
                            <Link href={route('front.internships.logbooks.create', { internship: activeInternship.id })}>Buat Baru</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
