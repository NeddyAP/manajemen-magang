import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseNotification } from '@/types';
import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';

interface NotificationSummaryCardProps {
    notifications: DatabaseNotification[];
}

export function NotificationSummaryCard({ notifications }: NotificationSummaryCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifikasi Terbaru</CardTitle>
                <Bell className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                {notifications.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Tidak ada notifikasi baru.</p>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="flex flex-col space-y-1 rounded-md border p-3 shadow-sm">
                                <p className="text-sm font-medium">{notification.data.message}</p>
                                <p className="text-muted-foreground text-xs">
                                    {new Date(notification.created_at).toLocaleString('id-ID', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </p>
                                {(notification.data.link || notification.data.url) && (
                                    <Link
                                        href={notification.data.link || notification.data.url || '#'}
                                        className="text-primary text-xs hover:underline"
                                    >
                                        Lihat Detail
                                    </Link>
                                )}
                            </div>
                        ))}
                        <Button asChild variant="outline" className="w-full">
                            <Link href={route('notifications.index')}>Lihat Semua Notifikasi</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
