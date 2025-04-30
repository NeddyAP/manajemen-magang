import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface TutorialStats {
    total_tutorials: number;
    active_tutorials: number;
    inactive_tutorials: number;
    recent_count_30d: number;
}

const TutorialRecentAnalytics: React.FC = () => {
    const [stats, setStats] = useState<TutorialStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch the same summary data
                const response = await axios.get<TutorialStats>(route('admin.analytics.tutorial-stats'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching tutorial stats:', err);
                setError('Failed to load recent tutorial statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
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
                        <p className="text-2xl font-bold">{stats.recent_count_30d}</p>
                        <p className="text-muted-foreground text-xs">Tutorials Created (Last 30 Days)</p>
                    </div>
                )}
                {!loading && !error && !stats && <p className="text-muted-foreground text-sm">No recent data available.</p>}
            </CardContent>
        </Card>
    );
};

export default TutorialRecentAnalytics;
