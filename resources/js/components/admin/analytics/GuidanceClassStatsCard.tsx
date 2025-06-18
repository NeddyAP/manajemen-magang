import { Icon } from '@/components/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { Calendar, CalendarCheck, CalendarX } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GuidanceClassStatsData {
    total_classes: number;
    upcoming_classes: number;
    past_classes: number;
}

export function GuidanceClassStatsCard() {
    const [stats, setStats] = useState<GuidanceClassStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route('admin.analytics.guidance-class-stats'))
            .then((response) => {
                setStats(response.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching guidance class stats:', err);
                setError('Gagal memuat statistik kelas bimbingan.');
                setStats(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik Kelas Bimbingan</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && <p>Memuat...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {stats && !loading && !error && (
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Icon iconNode={Calendar} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Total Kelas</span>
                                <span className="font-semibold text-2xl text-blue-600">{stats.total_classes}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Icon iconNode={CalendarCheck} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Kelas Mendatang</span>
                                <span className="font-semibold text-2xl text-green-600">{stats.upcoming_classes}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Icon iconNode={CalendarX} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Kelas Selesai</span>
                                <span className="font-semibold text-2xl text-gray-600">{stats.past_classes}</span>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        {stats.total_classes > 0 && (
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Progress Kelas</span>
                                    <span>{Math.round((stats.past_classes / stats.total_classes) * 100)}% Selesai</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min((stats.past_classes / stats.total_classes) * 100, 100)}%` }}
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