import { Icon } from '@/components/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { BookOpen, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TutorialStatsData {
    total_tutorials: number;
    active_tutorials: number;
    inactive_tutorials: number;
    recent_count_30d: number;
}

export function TutorialStatsCard() {
    const [stats, setStats] = useState<TutorialStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route('admin.analytics.tutorial-stats'))
            .then((response) => {
                setStats(response.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching tutorial stats:', err);
                setError('Gagal memuat statistik tutorial.');
                setStats(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik Tutorial</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && <p>Memuat...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {stats && !loading && !error && (
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Icon iconNode={BookOpen} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Total Tutorial</span>
                                <span className="font-semibold text-2xl text-blue-600">{stats.total_tutorials}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Icon iconNode={CheckCircle} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Tutorial Aktif</span>
                                <span className="font-semibold text-2xl text-green-600">{stats.active_tutorials}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Icon iconNode={XCircle} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Tutorial Nonaktif</span>
                                <span className="font-semibold text-2xl text-gray-600">{stats.inactive_tutorials}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Icon iconNode={Plus} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Baru (30 hari)</span>
                                <span className="font-semibold text-2xl text-purple-600">{stats.recent_count_30d}</span>
                            </div>
                        </div>

                        {/* Activity indicator */}
                        {stats.total_tutorials > 0 && (
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Tutorial Aktif</span>
                                    <span>{Math.round((stats.active_tutorials / stats.total_tutorials) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((stats.active_tutorials / stats.total_tutorials) * 100, 100)}%` }}
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