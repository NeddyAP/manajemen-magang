import { Badge } from '@/components/ui/badge'; // Assuming Badge component exists
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface LogbookStatusCounts {
    pending: number;
    approved: number;
    rejected: number;
}

interface LogbookStats {
    total_logbooks: number;
    by_status: LogbookStatusCounts;
    recent_count_7d: number;
}

const LogbookStatusAnalytics: React.FC = () => {
    const [stats, setStats] = useState<LogbookStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch the same summary data
                const response = await axios.get<LogbookStats>(route('admin.analytics.logbook-summary'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching logbook stats:', err);
                setError('Gagal memuat statistik status logbook.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Helper to determine badge variant based on status
    const getBadgeVariant = (status: keyof LogbookStatusCounts): 'default' | 'destructive' | 'secondary' | 'outline' | null | undefined => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'approved':
                return 'default'; // Changed from 'success'
            case 'rejected':
                return 'destructive';
            default:
                return 'default';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Logbook Berdasarkan Status</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                )}
                {error && <p className="text-destructive text-sm">{error}</p>}
                {!loading && !error && stats && stats.by_status && (
                    <div className="space-y-2">
                        {Object.entries(stats.by_status).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <Badge variant={getBadgeVariant(status as keyof LogbookStatusCounts)} className="capitalize">
                                    {status === 'pending'
                                        ? 'Menunggu'
                                        : status === 'approved'
                                          ? 'Disetujui'
                                          : status === 'rejected'
                                            ? 'Ditolak'
                                            : status}
                                </Badge>
                                <span className="font-medium">{count}</span>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && !error && (!stats || !stats.by_status) && (
                    <p className="text-muted-foreground text-sm">Tidak ada data status tersedia.</p>
                )}
            </CardContent>
        </Card>
    );
};

export default LogbookStatusAnalytics;
