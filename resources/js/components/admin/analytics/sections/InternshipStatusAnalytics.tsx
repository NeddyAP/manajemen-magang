import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface InternshipStats {
    total_internships: number;
    by_status: { [key: string]: number };
    by_type: { [key: string]: number };
}

const InternshipStatusAnalytics: React.FC = () => {
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
                setError('Failed to load internship status statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Helper to determine badge variant based on status
    const getBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
        switch (status) {
            case 'waiting':
                return 'secondary';
            case 'accepted':
                return 'default';
            case 'rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    // Get translated status name
    const getStatusName = (status: string): string => {
        switch (status) {
            case 'waiting':
                return 'Menunggu';
            case 'accepted':
                return 'Diterima';
            case 'rejected':
                return 'Ditolak';
            default:
                return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Status Magang</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                )}
                {error && <p className="text-destructive text-sm">{error}</p>}
                {!loading && !error && stats && stats.by_status && (
                    <div className="space-y-2">
                        {Object.entries(stats.by_status).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <Badge variant={getBadgeVariant(status)} className="capitalize">
                                    {getStatusName(status)}
                                </Badge>
                                <span className="font-medium">{count}</span>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && !error && (!stats || !stats.by_status) && <p className="text-muted-foreground text-sm">No status data available.</p>}
            </CardContent>
        </Card>
    );
};

export default InternshipStatusAnalytics;
