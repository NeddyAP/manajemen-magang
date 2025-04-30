import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface UserRoleStat {
    role: string;
    total: number;
}

interface UserStats {
    total_users: number;
    users_by_role: UserRoleStat[];
    active_users_30d: number;
    recent_registrations_7d: number;
}

const UserActiveAnalytics: React.FC = () => {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch the same summary data
                const response = await axios.get<UserStats>(route('admin.analytics.user-stats'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching user stats:', err);
                setError('Failed to load active user statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Users</CardTitle>
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
                        <p className="text-2xl font-bold">{stats.active_users_30d}</p>
                        <p className="text-muted-foreground text-xs">Logged In (Last 30 Days)</p>
                    </div>
                )}
                {!loading && !error && !stats && <p className="text-muted-foreground text-sm">No data available.</p>}
            </CardContent>
        </Card>
    );
};

export default UserActiveAnalytics;
