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

const InternshipTypeAnalytics: React.FC = () => {
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
                setError('Failed to load internship type statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Helper to determine badge variant based on type
    const getBadgeVariant = (type: string): 'default' | 'secondary' => {
        switch (type) {
            case 'kkl':
                return 'default';
            case 'kkn':
                return 'secondary';
            default:
                return 'default';
        }
    };

    // Get translated type name for display
    const getTypeName = (type: string): string => {
        switch (type) {
            case 'kkl':
                return 'KKL';
            case 'kkn':
                return 'KKN';
            default:
                return type.toUpperCase();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Jenis Magang</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                )}
                {error && <p className="text-destructive text-sm">{error}</p>}
                {!loading && !error && stats && stats.by_type && (
                    <div className="space-y-2">
                        {Object.entries(stats.by_type).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                                <Badge variant={getBadgeVariant(type)} className="capitalize">
                                    {getTypeName(type)}
                                </Badge>
                                <span className="font-medium">{count}</span>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && !error && (!stats || !stats.by_type) && <p className="text-muted-foreground text-sm">No type data available.</p>}
            </CardContent>
        </Card>
    );
};

export default InternshipTypeAnalytics;
