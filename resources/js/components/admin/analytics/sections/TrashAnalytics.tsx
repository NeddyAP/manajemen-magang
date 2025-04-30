import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface TrashStats {
    total_items_in_trash: number | string; // Backend might return 'N/A' initially
    // Add more specific stats as needed when backend is implemented
}

const TrashAnalytics: React.FC = () => {
    const [stats, setStats] = useState<TrashStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<TrashStats>(route('admin.analytics.trash-stats'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching trash stats:', err);
                setError('Gagal memuat statistik sampah.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Sampah</CardTitle>
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
                        <p className="text-2xl font-bold">{stats.total_items_in_trash}</p>
                        <p className="text-muted-foreground text-xs">Total Item di Sampah</p>
                        {/* Render more stats here */}
                        {/* TODO: Implement backend logic and update frontend */}
                    </div>
                )}
                {!loading && !error && !stats && !error && (
                    <p className="text-muted-foreground text-sm">Tidak ada data tersedia atau backend belum diimplementasikan.</p>
                )}
            </CardContent>
        </Card>
    );
};

export default TrashAnalytics;
