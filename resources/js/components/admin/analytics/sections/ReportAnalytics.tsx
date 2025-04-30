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

const ReportAnalytics: React.FC = () => {
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<ReportStats>(route('admin.analytics.report-summary'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching report stats:', err);
                setError('Gagal memuat statistik laporan.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Laporan</CardTitle>
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
                        <p className="text-2xl font-bold">{stats.total_reports}</p>
                        <p className="text-muted-foreground text-xs">Total Laporan Dikirim</p>
                        {/* Render more stats here */}
                        {/* TODO: Add charts or more detailed breakdowns */}
                    </div>
                )}
                {!loading && !error && !stats && !error && <p className="text-muted-foreground text-sm">Tidak ada data tersedia.</p>}
            </CardContent>
        </Card>
    );
};

export default ReportAnalytics;
