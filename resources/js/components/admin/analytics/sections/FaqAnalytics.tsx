import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface FaqStats {
    total_faqs: number;
    active_faqs: number;
    inactive_faqs: number;
    recent_count_30d: number;
}

const FaqAnalytics: React.FC = () => {
    const [stats, setStats] = useState<FaqStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<FaqStats>(route('admin.analytics.faq-stats'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching FAQ stats:', err);
                setError('Gagal memuat statistik FAQ.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan FAQ</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
                {error && <p className="text-destructive text-sm">{error}</p>}
                {!loading && !error && stats && (
                    <div className="grid gap-2">
                        <div>
                            <p className="text-2xl font-bold">{stats.total_faqs}</p>
                            <p className="text-muted-foreground text-xs">Total FAQ</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.active_faqs}</p>
                            <p className="text-muted-foreground text-xs">FAQ Aktif</p>
                        </div>
                        {/* Render more stats here */}
                        {/* TODO: Add charts or more detailed breakdowns (e.g., view counts if implemented) */}
                    </div>
                )}
                {!loading && !error && !stats && !error && <p className="text-muted-foreground text-sm">Tidak ada data yang tersedia.</p>}
            </CardContent>
        </Card>
    );
};

export default FaqAnalytics;
