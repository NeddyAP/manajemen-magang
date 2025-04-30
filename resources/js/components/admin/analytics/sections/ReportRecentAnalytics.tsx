import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface ReportStatusCounts {
    pending: number;
    approved: number;
    rejected: number;
}

interface ReportStats {
    total_reports: number;
    by_status: ReportStatusCounts;
    recent_count_7d: number;
}

const ReportRecentAnalytics: React.FC = () => {
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch the same summary data
                const response = await axios.get<ReportStats>(route('admin.analytics.report-summary'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching report stats:', err);
                setError('Gagal memuat statistik laporan terbaru.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
                {error && <p className="text-destructive text-sm">{error}</p>}
                {!loading && !error && stats && (
                    <div>
                        <p className="text-2xl font-bold">{stats.recent_count_7d}</p>
                        <p className="text-muted-foreground text-xs">Laporan Dikirim (7 Hari Terakhir)</p>
                    </div>
                )}
                {!loading && !error && !stats && <p className="text-muted-foreground text-sm">Tidak ada data terbaru tersedia.</p>}
            </CardContent>
        </Card>
    );
};

export default ReportRecentAnalytics;
