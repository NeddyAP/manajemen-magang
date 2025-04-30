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

const UserAnalytics: React.FC = () => {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<UserStats>(route('admin.analytics.user-stats'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching user stats:', err);
                setError('Failed to load user statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Summary</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                )}
                {error && <p className="text-destructive text-sm">{error}</p>}
                {!loading && !error && stats && (
                    <div className="grid gap-4">
                        <div>
                            <p className="text-2xl font-bold">{stats.total_users}</p>
                            <p className="text-muted-foreground text-xs">Total Registered Users</p>
                        </div>
                        <div>
                            <h4 className="mb-1 text-sm font-medium">Users by Role:</h4>
                            {stats.users_by_role.length > 0 ? (
                                <ul className="text-muted-foreground list-disc pl-5 text-sm">
                                    {stats.users_by_role.map((roleStat) => (
                                        <li key={roleStat.role}>
                                            {roleStat.role}: {roleStat.total}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-sm">No role data available.</p>
                            )}
                        </div>
                        {/* Render more stats here */}
                        {/* TODO: Add charts or more detailed breakdowns (e.g., activity) */}
                    </div>
                )}
                {!loading && !error && !stats && !error && <p className="text-muted-foreground text-sm">No data available.</p>}
            </CardContent>
        </Card>
    );
};

export default UserAnalytics;
