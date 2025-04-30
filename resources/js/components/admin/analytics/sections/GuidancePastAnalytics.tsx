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

const GuidancePastAnalytics: React.FC = () => {
    const [stats, setStats] = useState<GuidanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch the same summary data
                const response = await axios.get<GuidanceStats>(route('admin.analytics.guidance-class-stats'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching guidance class stats:', err);
                setError('Failed to load past guidance class statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Past Classes</CardTitle>
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
                        <p className="text-2xl font-bold">{stats.past_classes}</p>
                        <p className="text-muted-foreground text-xs">Classes Completed</p>
                    </div>
                )}
                {!loading && !error && !stats && <p className="text-muted-foreground text-sm">No past data available.</p>}
            </CardContent>
        </Card>
    );
};

export default GuidancePastAnalytics;
