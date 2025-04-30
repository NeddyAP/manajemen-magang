import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface GlobalVarStats {
    total_variables: number;
    active_variables: number;
    inactive_variables: number;
    recent_count_30d: number;
}

const GlobalVarInactiveAnalytics: React.FC = () => {
    const [stats, setStats] = useState<GlobalVarStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch the same summary data
                const response = await axios.get<GlobalVarStats>(route('admin.analytics.global-variable-stats'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching global variable stats:', err);
                setError('Failed to load inactive global variable statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inactive Variables</CardTitle>
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
                        <p className="text-2xl font-bold">{stats.inactive_variables}</p>
                        <p className="text-muted-foreground text-xs">Currently Inactive</p>
                    </div>
                )}
                {!loading && !error && !stats && <p className="text-muted-foreground text-sm">No data available.</p>}
            </CardContent>
        </Card>
    );
};

export default GlobalVarInactiveAnalytics;
