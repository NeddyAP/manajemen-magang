import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logbook } from '@/types/internship';
import { Link } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { Button } from '../../ui/button';

interface PendingLogbooksCardProps {
    logbooks: Logbook[];
    totalPending: number;
}

export function PendingLogbooksCard({ logbooks, totalPending }: PendingLogbooksCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Logbook Menunggu Review</CardTitle>
                <ClipboardList className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalPending}</div>
                <p className="text-muted-foreground text-xs">Total Logbook Belum Direview</p>

                <div className="mt-4 space-y-3">
                    {logbooks.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Tidak ada logbook yang perlu direview.</p>
                    ) : (
                        logbooks.map((logbook) => (
                            <div key={logbook.id} className="flex flex-col space-y-1 rounded-md border p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{logbook.internship?.user?.name}</p>
                                    <span className="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">Menunggu</span>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    {new Date(logbook.date || '').toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                </p>
                                <p className="line-clamp-2 text-xs">{logbook.activities}</p>
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

                {logbooks.length > 0 && totalPending > logbooks.length && (
                    <div className="mt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href={route('front.internships.logbooks.intern-list')}>Lihat Semua Logbook</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
