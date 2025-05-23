import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface GuidanceStats {
    total_classes: number;
    upcoming_classes: number;
    past_classes: number;
    // Add average_attendance?: number; // Optional, if implemented later
}

const GuidanceAnalytics: React.FC = () => {
    const [stats, setStats] = useState<GuidanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<GuidanceStats>(route('admin.analytics.guidance-class-stats'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching guidance class stats:', err);
                setError('Failed to load guidance class statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rangkuman Kelas Bimbingan</CardTitle>
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
                        <p className="text-2xl font-bold">{stats.total_classes}</p>
                        <p className="text-muted-foreground text-xs">Total Kelas Bimbingan Dibuat</p>
                        {/* Render more stats here */}
                        {/* TODO: Add charts or more detailed breakdowns (e.g., attendance) */}
                    </div>
                )}
                {!loading && !error && !stats && !error && <p className="text-muted-foreground text-sm">Data tidak tersedia.</p>}
            </CardContent>
        </Card>
    );
};

export default GuidanceAnalytics;
