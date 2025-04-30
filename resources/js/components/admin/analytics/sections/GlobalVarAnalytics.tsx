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

const GlobalVarAnalytics: React.FC = () => {
    const [stats, setStats] = useState<GlobalVarStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get<GlobalVarStats>(route('admin.analytics.global-variable-stats'));
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching global variable stats:', err);
                setError('Gagal memuat statistik variabel global.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Variabel Global</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
                {error && <p className="text-destructive text-sm">{error}</p>}
                {!loading && !error && stats && (
                    <div className="grid gap-2">
                        <div>
                            <p className="text-2xl font-bold">{stats.total_variables}</p>
                            <p className="text-muted-foreground text-xs">Total Variabel</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.active_variables}</p>
                            <p className="text-muted-foreground text-xs">Variabel Aktif</p>
                        </div>
                        {/* Render more stats here */}
                    </div>
                )}
                {!loading && !error && !stats && !error && <p className="text-muted-foreground text-sm">Tidak ada data yang tersedia.</p>}
            </CardContent>
        </Card>
    );
};

export default GlobalVarAnalytics;
