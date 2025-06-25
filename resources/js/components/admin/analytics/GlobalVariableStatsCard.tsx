import { Icon } from '@/components/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { CheckCircle, Plus, Settings, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GlobalVariableStatsData {
    total_variables: number;
    active_variables: number;
    inactive_variables: number;
    recent_count_30d: number;
}

export function GlobalVariableStatsCard() {
    const [stats, setStats] = useState<GlobalVariableStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route('admin.analytics.global-variable-stats'))
            .then((response) => {
                setStats(response.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching global variable stats:', err);
                setError('Gagal memuat statistik variabel global.');
                setStats(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik Variabel Global</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && <p>Memuat...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {stats && !loading && !error && (
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Icon iconNode={Settings} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Total Variabel</span>
                                <span className="text-2xl font-semibold text-blue-600">{stats.total_variables}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Icon iconNode={CheckCircle} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Variabel Aktif</span>
                                <span className="text-2xl font-semibold text-green-600">{stats.active_variables}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Icon iconNode={XCircle} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Variabel Nonaktif</span>
                                <span className="text-2xl font-semibold text-gray-600">{stats.inactive_variables}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Icon iconNode={Plus} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Baru (30 hari)</span>
                                <span className="text-2xl font-semibold text-purple-600">{stats.recent_count_30d}</span>
                            </div>
                        </div>

                        {/* Activity indicator */}
                        {stats.total_variables > 0 && (
                            <div className="mt-6 space-y-2">
                                <div className="text-muted-foreground flex justify-between text-sm">
                                    <span>Variabel Aktif</span>
                                    <span>{Math.round((stats.active_variables / stats.total_variables) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div
                                        className="h-2 rounded-full bg-green-600 transition-all duration-300"
                                        style={{ width: `${Math.min((stats.active_variables / stats.total_variables) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
