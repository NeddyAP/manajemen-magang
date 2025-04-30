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

const LogbookAnalytics: React.FC = () => {
    const [stats, setStats] = useState<LogbookStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<LogbookStats>(route('admin.analytics.logbook-summary'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching logbook stats:', err);
                setError('Gagal memuat statistik logbook.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Logbook</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        {/* Add more skeletons if more stats are expected */}
                    </div>
                )}
                {error && <p className="text-destructive text-sm">{error}</p>}
                {!loading && !error && stats && (
                    <div>
                        <p className="text-2xl font-bold">{stats.total_logbooks}</p>
                        <p className="text-muted-foreground text-xs">Total Logbook Dikirim</p>
                        {/* Render more stats here */}
                        {/* TODO: Add charts or more detailed breakdowns */}
                    </div>
                )}
                {!loading && !error && !stats && !error && <p className="text-muted-foreground text-sm">Tidak ada data tersedia.</p>}
            </CardContent>
        </Card>
    );
};

export default LogbookAnalytics;
