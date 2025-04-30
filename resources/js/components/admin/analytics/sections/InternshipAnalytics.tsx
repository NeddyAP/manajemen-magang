import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface InternshipStats {
    total_internships: number;
    by_status: { [key: string]: number };
    by_type: { [key: string]: number };
}

const InternshipAnalytics: React.FC = () => {
    const [stats, setStats] = useState<InternshipStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<InternshipStats>(route('admin.analytics.internship-stats'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching internship stats:', err);
                setError('Failed to load internship statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Internship Summary</CardTitle>
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
                        <p className="text-2xl font-bold">{stats.total_internships}</p>
                        <p className="text-muted-foreground text-xs">Total Internship Applications</p>
                    </div>
                )}
                {!loading && !error && !stats && <p className="text-muted-foreground text-sm">No data available.</p>}
            </CardContent>
        </Card>
    );
};

export default InternshipAnalytics;
